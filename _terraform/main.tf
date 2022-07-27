terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

terraform {
  backend "s3" {
    bucket = "sd4cc-terraform-backend"
    key    = "main/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_cognito_user_pool" "user_pool" {
  name = "jobsuche_user_pool"

  auto_verified_attributes = ["email"]
  password_policy {
    minimum_length = 6
  }

  verification_message_template {
    default_email_option  = "CONFIRM_WITH_LINK"
    email_subject         = "Account Confirmation"
    email_message_by_link = "Hello from Jobsuche! Please click the following Link to activate your account: {##Click Here##}"
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "email"
    required                 = true

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }
  schema {
    name                = "phone_number"
    attribute_data_type = "String"
    required            = false
  }
}

resource "aws_cognito_user_pool_domain" "userpool_domain" {
  domain       = "jobsuche-mail"
  user_pool_id = aws_cognito_user_pool.user_pool.id
}

resource "aws_cognito_user_pool_client" "client" {
  name = "jobsuche-userpool-client"

  user_pool_id                  = aws_cognito_user_pool.user_pool.id
  generate_secret               = false
  refresh_token_validity        = 90
  prevent_user_existence_errors = "ENABLED"
  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_ADMIN_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]
}

resource "aws_iam_role" "websocket-role" {
  name = "websocket-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Sid       = ""
        Principal = { AWS = "*" }
      },
    ]
  })
}


resource "aws_iam_role_policy_attachment" "websocket-invoke-policy" {
  role       = aws_iam_role.websocket-role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}


resource "aws_iam_role_policy_attachment" "lambda-access-dynamodb-policy" {
  role       = aws_iam_role.websocket-role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonAPIGatewayInvokeFullAccess"
}

resource "aws_iam_role_policy_attachment" "lambda-access-log-policy" {
  role       = aws_iam_role.websocket-role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_dynamodb_table" "job_websocket_connections_table" {
  name           = "JobWebsocketConnections"
  hash_key       = "JobId"
  range_key      = "ConnectionId"
  read_capacity  = 1
  write_capacity = 1

  attribute {
    name = "JobId"
    type = "S"
  }

  attribute {
    name = "ConnectionId"
    type = "S"
  }

  global_secondary_index {
    name            = "ConnectionIdIndex"
    hash_key        = "ConnectionId"
    range_key       = "JobId"
    write_capacity  = 5
    read_capacity   = 2
    projection_type = "KEYS_ONLY"
  }
}

resource "aws_dynamodb_table" "job_commments_table" {
  name           = "JobComments"
  hash_key       = "JobId"
  range_key      = "RangeKeyHash"
  read_capacity  = 5
  write_capacity = 2

  global_secondary_index { //enables to query messages for a given user, or for given user at a certain date. Returns only the RangeKeyHash and keys to avoid a whole copy of the table,
    // however with these unique RangeKeyHashs, the complete Comment objects can be retrieved
    name               = "UserSubTimestampIndex"
    hash_key           = "UserSub"
    range_key          = "Timestamp"
    write_capacity     = 5
    read_capacity      = 2
    projection_type    = "INCLUDE"
    non_key_attributes = ["RangeKeyHash"]
  }

  attribute {
    name = "JobId"
    type = "S"
  }

  attribute {
    name = "RangeKeyHash" //unique identifier, hash result from UserSub and Timestamp
    type = "S"
  }

  attribute {
    name = "UserSub"
    type = "S"
  }

  attribute {
    name = "Timestamp"
    type = "S"
  }
}

resource "aws_lambda_function" "websocket_sign_up_page" {
  function_name = "websocket_sign_up_page"
  role          = aws_iam_role.websocket-role.arn
  s3_bucket     = "sd4cc-lambda-bucket"
  s3_key        = "index.zip"
  handler       = "index.handler"
  runtime       = "nodejs12.x"

  environment {
    variables = {
      job_websocket_connections_table = aws_dynamodb_table.job_websocket_connections_table.name
      job_commments_table             = aws_dynamodb_table.job_commments_table.name
    }
  }
}

resource "aws_lambda_function" "websocket_disconnect" {
  function_name = "websocket_disconnect"
  role          = aws_iam_role.websocket-role.arn
  s3_bucket     = "sd4cc-lambda-bucket"
  s3_key        = "index.zip"
  handler       = "index.handler"
  runtime       = "nodejs12.x"

  environment {
    variables = {
      job_websocket_connections_table = aws_dynamodb_table.job_websocket_connections_table.name
      job_commments_table             = aws_dynamodb_table.job_commments_table.name
    }
  }
}

resource "aws_lambda_function" "websocket_handle_jobcomment" {
  function_name = "websocket_handle_jobcomment"
  role          = aws_iam_role.websocket-role.arn
  s3_bucket     = "sd4cc-lambda-bucket"
  s3_key        = "index.zip"
  handler       = "index.handler"
  runtime       = "nodejs12.x"

  environment {
    variables = {
      job_websocket_connections_table = aws_dynamodb_table.job_websocket_connections_table.name
      job_commments_table             = aws_dynamodb_table.job_commments_table.name
      user_pool_id                    = aws_cognito_user_pool.user_pool.id
      client_id                       = aws_cognito_user_pool_client.client.id
      region                          = "us-east-1"
    }
  }
}

resource "aws_apigatewayv2_api" "websocket_jobsuche_api" {
  name                       = "websocket_jobsuche_api"
  protocol_type              = "WEBSOCKET"
  route_selection_expression = "$request.body.action"
}

resource "aws_lambda_permission" "lambda_permission" {
  statement_id  = "allow_invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.websocket_sign_up_page.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.websocket_jobsuche_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "lambda_permission2" {
  statement_id  = "allow_invoke_2"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.websocket_disconnect.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.websocket_jobsuche_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "lambda_permission3" {
  statement_id  = "allow_invoke_3"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.websocket_handle_jobcomment.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.websocket_jobsuche_api.execution_arn}/*/*"
}

resource "aws_apigatewayv2_integration" "websocket_jobsuche_connect_integration" {
  api_id             = aws_apigatewayv2_api.websocket_jobsuche_api.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.websocket_sign_up_page.invoke_arn

}

resource "aws_apigatewayv2_route" "websocket_jobsuche_connect" {
  api_id    = aws_apigatewayv2_api.websocket_jobsuche_api.id
  route_key = "signUpPage"
  target    = "integrations/${aws_apigatewayv2_integration.websocket_jobsuche_connect_integration.id}"
}

resource "aws_apigatewayv2_integration" "websocket_jobsuche_disconnect_integration" {
  api_id             = aws_apigatewayv2_api.websocket_jobsuche_api.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.websocket_disconnect.invoke_arn
}

resource "aws_apigatewayv2_route" "websocket_jobsuche_disconnect" {
  api_id    = aws_apigatewayv2_api.websocket_jobsuche_api.id
  route_key = "$disconnect"
  target    = "integrations/${aws_apigatewayv2_integration.websocket_jobsuche_disconnect_integration.id}"
}

resource "aws_apigatewayv2_integration" "websocket_jobsuche_comment_job_integration" {
  api_id             = aws_apigatewayv2_api.websocket_jobsuche_api.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.websocket_handle_jobcomment.invoke_arn
}

resource "aws_apigatewayv2_route" "websocket_jobsuche_comment_job" {
  api_id    = aws_apigatewayv2_api.websocket_jobsuche_api.id
  route_key = "commentJob"
  target    = "integrations/${aws_apigatewayv2_integration.websocket_jobsuche_comment_job_integration.id}"
}

resource "aws_apigatewayv2_stage" "production" {
  api_id      = aws_apigatewayv2_api.websocket_jobsuche_api.id
  name        = "production"
  auto_deploy = true
  default_route_settings {
    throttling_rate_limit  = 1000
    throttling_burst_limit = 1000
  }
}
