<script setup lang="ts">import { AwsAuthService } from '../lib/AwsAuthService';
import { IJobComment } from '../lib/JobComment';

const props = defineProps({
	id: {
		type: String,
		required: true,
	},
});

const jobDetailStore = inject("jobDetailStore") as any;
const { data, error, loading, getData, abort } = useApi();

if (!jobDetailStore.getData(props.id)) {
	(getData as any)("/details/" + btoa(props.id));

	watch(data, (newData) => {
		jobDetailStore.addData(data, props.id);
	});
}


const authService = inject("AwsAuthService") as AwsAuthService;
const jobComments = ref<IJobComment[]>([]);
const commentInput = ref<string | null>(null);

watch(jobComments, (newComments) => {
	newComments = Array.from(newComments.values()).sort((a, b) => {
		return a.Timestamp - b.Timestamp
	});
})

const connecting = ref(true);
const ws = new WebSocket("wss://21h1ym9kpl.execute-api.us-east-1.amazonaws.com/production");
ws.onopen = (event) => {
	const message = {
		action: "signUpPage",
		Page: props.id
	}
	ws.send(JSON.stringify(message));
};
ws.onmessage = (event) => {
	const data = JSON.parse((event as any).data);
	if (data.action == "signUpPage") {
		connecting.value = false;
		jobComments.value = data.Comments;
	} else if (data.action == "commentJob") {
		const comment = data.Comment as IJobComment;
		jobComments.value.push(comment);
		if (comment.RangeKeyHash == pendingCommentRKH.value) {
			pendingCommentRKH.value = null;
			commentInput.value = null;
		}
	}
}
ws.onerror = (event) => {
	console.error(event);
}

const pendingCommentRKH = ref<string | null>(null);

const sendComment = () => {
	if (!commentInput.value) {
		return console.log("Empty message!");
	}
	if (!authService.currentUser.value) {
		return console.log("Not logged in!");
	}

	const now = new Date().getTime();

	const comment: IJobComment = {
		Text: commentInput.value,
		Timestamp: now,
		UserName: authService.currentUser.value.Username,
		UserSub: authService.currentUser.value.Sub,
		RangeKeyHash: authService.currentUser.value.Sub + now,
	};
	const message = {
		action: "commentJob",
		Authorization: authService.currentUser.value.IdToken,
		Comment: comment
	}
	pendingCommentRKH.value = comment.RangeKeyHash;
	ws.send(JSON.stringify(message));
};


onBeforeUnmount(() => {
	ws.close(1000);
});
</script>

<template>
	{{ props.id }}
	<n-card>
		<n-spin v-if="loading" size="large" />
		<pre v-else style="text-align: left">
			{{ JSON.stringify(jobDetailStore.getData(props.id), null, 2) }}
		</pre>
	</n-card>
	<n-divider></n-divider>
	<n-spin v-if="connecting"></n-spin>
	<n-space v-else vertical>
		<n-space vertical>
			<JobComment v-for="comment in jobComments" :key="comment.Timestamp + comment.UserSub" :Comment="comment">
			</JobComment>
		</n-space>
		<n-space justify="end">
			<n-input v-model:value="commentInput" placeholder="Kommentar..." @keyup.enter="sendComment"
				:disabled="!authService.currentUser.value" />
			<n-spin v-if="pendingCommentRKH"></n-spin>
			<n-button v-else @click="sendComment" :disabled="!authService.currentUser.value">Senden</n-button>
		</n-space>
		<n-space justify="end">
			<n-text v-if="!authService.currentUser.value" italic>Melden Sie sich an um an der Unterhaltung teilzunehmen.
			</n-text>
		</n-space>
	</n-space>
</template>

