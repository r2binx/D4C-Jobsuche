deploy:
	bx wsk deploy -m ow_manifest.yaml

undeploy:
	bx wsk undeploy -m ow_manifest.yaml

create: deploy
	bx wsk package update jobsuche-dev -p bucket auth -p cos_endpoint ${COS_ENDPOINT}
	bx wsk service bind cloud-object-storage jobsuche-dev --instance jobsuche-jwt