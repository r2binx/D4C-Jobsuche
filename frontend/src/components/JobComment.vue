<script setup lang="ts">
import { AwsAuthService } from "../lib/AwsAuthService";
import { IJobComment } from "../lib/JobComment";
const props = defineProps({
	userComment: {
		type: Object as () => IJobComment,
		required: true,
	},
});

const authService = inject("AwsAuthService") as AwsAuthService;
const currentUser = $(authService.currentUser);

let isOwnComment = $ref(props.userComment.UserSub == currentUser?.Sub ? true : false);

watch(currentUser, () => {
	isOwnComment = props.userComment.UserSub == currentUser?.Sub ? true : false;
});
</script>
<template>
	<div :class="'comment' + (isOwnComment ? ' ownComment' : '')" style="width: 100%">
		<div class="commentCard">
			<n-text
				italic
				:type="isOwnComment ? 'success' : 'default'"
				:class="'comment' + (isOwnComment ? ' ownComment' : '')"
			>
				{{ props.userComment.UserName + ", "
				}}{{ new Date(props.userComment.Timestamp).toLocaleString() }}
			</n-text>
			<n-text>
				{{ props.userComment.Text }}
			</n-text>
		</div>
	</div>
</template>

<style>
.commentCard {
	width: 80%;
	background-color: #ececec;
	border-radius: 1em;
	padding: 0 1em 1em 1em;
}

.comment {
	display: flex;
	justify-content: start;
	margin-top: 1em;
	margin-bottom: 1em;
}

.ownComment {
	justify-content: end;
}
</style>
