<script setup lang="ts">
import { IJobComment } from "../lib/JobComment";

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
		jobDetailStore.addData((newData as any).result, props.id);
	});
}

const { currentUser } = $(inject("AwsAuthService") as AwsAuthService);
let jobComments = $ref<IJobComment[]>(null);
let commentInput = $ref<string>(null);
let commentConntainerRef = $ref();

let connecting = $ref(true);
const ws = new WebSocket("wss://" + import.meta.env.VITE_WS_ENDPOINT);
ws.onopen = (event) => {
	const message = {
		action: "signUpPage",
		Page: props.id,
	};
	ws.send(JSON.stringify(message));
};
ws.onmessage = (event) => {
	const data = JSON.parse((event as any).data);
	if (data.action == "signUpPage") {
		connecting = false;
		jobComments =
			data.Comments.length > 0
				? data.Comments.sort((a, b) => {
						return b.Timestamp - a.Timestamp;
				  })
				: null;
	} else if (data.action == "commentJob") {
		//sorry für den komischen code hier... aber Vue ignoriert einfach die Sortierung der Elemente im Array, auch beinem reactive array... so klappts jetzt auch wenns hässlich is :D
		const comment = data.Comment as IJobComment;
		const newComments = Array.from(jobComments || []);
		newComments.push(comment);
		newComments.sort((a, b) => {
			return b.Timestamp - a.Timestamp;
		});
		jobComments = null;
		jobComments = newComments;
		commentConntainerRef?.scrollTo({
			top: 0,
			behavior: "smooth",
		});
		if (comment.RangeKeyHash == pendingCommentRKH) {
			pendingCommentRKH = null;
			commentInput = null;
		}
	}
};
ws.onerror = (event) => {
	console.error(event);
};

const pendingCommentRKH = $ref<string>(null);

const sendComment = () => {
	if (!commentInput) {
		return console.log("Empty message!");
	}
	if (!currentUser) {
		return console.log("Not logged in!");
	}

	const now = new Date().getTime();

	const comment: IJobComment = {
		Text: commentInput,
		Timestamp: now,
		UserName: currentUser.Username,
		UserSub: currentUser.Sub,
		RangeKeyHash: currentUser.Sub + now,
	};
	const message = {
		action: "commentJob",
		Authorization: currentUser.IdToken,
		Comment: comment,
	};
	pendingCommentRKH = comment.RangeKeyHash;
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
		<n-space v-else style="text-align: left" vertical>
			<n-h2>{{ jobDetailStore.getData(props.id).titel }}</n-h2>
			<n-divider></n-divider>
			<n-space vertical>
				<div>
					<n-text underline>
						<n-h4>Beschreibung</n-h4>
					</n-text>
				</div>
				<div style="margin-bottom: 2em">
					<pre style="white-space: pre-wrap; font-family: unset">{{
						jobDetailStore.getData(props.id).stellenbeschreibung
					}}</pre>
				</div>
			</n-space>
			<n-space vertical>
				<div>
					<n-text underline>
						<n-h4>Information zum Arbeitsgeber</n-h4>
					</n-text>
				</div>
				<div>
					<a
						:href="jobDetailStore.getData(props.id).arbeitgeberdarstellungUrl"
						target="_blank"
					>
						{{ jobDetailStore.getData(props.id).arbeitgeber }}
					</a>
					<div>
						Land:
						{{
							" " + jobDetailStore.getData(props.id).arbeitgeberAdresse.land
						}}
					</div>
					<div>
						Ort:
						{{
							" " + jobDetailStore.getData(props.id).arbeitgeberAdresse.ort
						}}
					</div>
					<div>
						Plz:
						{{
							" " + jobDetailStore.getData(props.id).arbeitgeberAdresse.plz
						}}
					</div>
					<div>
						Straße:
						{{
							" " +
							jobDetailStore.getData(props.id).arbeitgeberAdresse.strasse
						}}
					</div>
				</div>
			</n-space>
		</n-space>
	</n-card>
	<n-divider></n-divider>
	<n-spin v-if="connecting"></n-spin>
	<n-space v-else vertical>
		<div ref="commentConntainerRef" class="commentContainer">
			<div v-if="!jobComments" class="noCommentsCard">Keine Kommentare</div>
			<JobComment
				v-else
				v-for="comment in jobComments"
				:key="comment.Timestamp + comment.UserSub"
				:userComment="comment"
			>
			</JobComment>
		</div>
		<n-space justify="end">
			<n-input
				v-model:value="commentInput"
				placeholder="Kommentar..."
				@keyup.enter="sendComment"
				:disabled="!currentUser"
			/>
			<n-spin v-if="pendingCommentRKH"></n-spin>
			<n-button v-else @click="sendComment" :disabled="!currentUser"
				>Senden</n-button
			>
		</n-space>
		<n-space justify="end">
			<n-text v-if="!currentUser" italic
				>Melden Sie sich an um an der Unterhaltung teilzunehmen.
			</n-text>
		</n-space>
	</n-space>
</template>

<style>
.noCommentsCard {
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	opacity: 0.5;
}

.commentContainer {
	overflow: auto;
	height: 300px;
	line-height: 1.5;
	display: flex;
	flex-direction: column-reverse;
}
</style>
