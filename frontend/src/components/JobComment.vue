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
    <div vertical :class="'comment' + (isOwnComment ? ' ownComment' : '')" style="width: 100%">
        <n-card style="max-width: 80%">
            <n-space vertical>
                <n-text italic :type="isOwnComment ? 'success' : 'default'"
                    :class="'comment' + (isOwnComment ? ' ownComment' : '')">
                    {{ props.Comment.UserName + ", " }}{{ new Date(props.Comment.Timestamp).toLocaleString() }}
                </n-text>
                <n-text>
                    {{ props.Comment.Text }}
                </n-text>
            </n-space>
        </n-card>
    </div>
</template>

<style>
.comment {
    display: flex;
    justify-content: start;
}

.ownComment {
    justify-content: end;
}
</style>
