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

const connecting = ref(true);
const ws = new WebSocket("wss://509ov5e9ok.execute-api.us-east-1.amazonaws.com/production");
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
	}
}
ws.onerror = (event) => {
	console.error(event);
}

const sendComment = () => {
	if (!commentInput.value) {
		return console.log("Empty message!");
	}
	const comment: IJobComment = {
		Text: commentInput.value,
		Timestamp: new Date().toLocaleString(),
		UserName: authService.currentUser.value?.Username || "12345",
		UserSub: authService.currentUser.value?.Sub || "12345",
	};
	const message = {
		action: "commentJob",
		Authorization: authService.currentUser.value?.IdToken || "asdf12345",
		Comment: comment
	}
	ws.send(JSON.stringify(message));
};


onBeforeUnmount(() => {
	ws.close(1000);
});


/*
disabled={{!authService.currentUser.value}}
 disabled={{!authService.currentUser.value}}*/
</script>
<template>
	{{ props.id }}
	<n-card>
		<n-spin v-if="loading" size="large" />
		<pre v-else style="text-align: left">
			{{ JSON.stringify(jobDetailStore.getData(props.id), null, 2) }}
		</pre>
	</n-card>
	<n-spin v-if="connecting"></n-spin>
	<n-space v-else vertical>
		<n-space vertical>
			<JobComment v-for="comment in jobComments" :key="comment.Timestamp + comment.UserSub" :Comment="comment">
			</JobComment>
		</n-space>
		<n-space justify="end">
			<n-input v-model:value="commentInput" placeholder="Kommentar..." @keyup.enter="sendComment" />
			<n-button @click="sendComment">Senden</n-button>
		</n-space>
		<n-space justify="end">
			<n-text v-if="!authService.currentUser.value">Melden Sie sich an um an der Unterhaltung teilzunehmen.
			</n-text>
		</n-space>
	</n-space>
</template>

