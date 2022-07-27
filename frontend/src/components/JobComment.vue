<script setup lang="ts">
import { AwsAuthService } from "../lib/AwsAuthService";
import { IJobComment } from "../lib/JobComment";
const props = defineProps({
    Comment: {
        type: Object as () => IJobComment,
        required: true,
    },
});

const authService = inject("AwsAuthService") as AwsAuthService;
const isOwnComment = ref(props.Comment.UserSub == authService.currentUser.value?.Sub ? true : false);

watch(authService.currentUser, () => {
    isOwnComment.value = props.Comment.UserSub == authService.currentUser.value?.Sub ? true : false;
})

</script>
<template>
    <div :class="'comment' + (isOwnComment ? ' ownComment' : '')" style="width: 100%">
        <div class="commentCard">
            <n-text italic :type="isOwnComment ? 'success' : 'default'"
                :class="'comment' + (isOwnComment ? ' ownComment' : '')">
                {{ props.Comment.UserName + ", " }}{{ new Date(props.Comment.Timestamp).toLocaleString() }}
            </n-text>
            <n-text>
                {{ props.Comment.Text }}
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
