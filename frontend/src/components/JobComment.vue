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

/*  <n-space vertical justify={{isOwnComment? "end" : "start" }}>
        <n-card>
            <div>
                <n-text>{{ props.data.UserName }}</n-text>
                <n-text style="{{isOwnComment ? " color: red" : "color: black" }}">{{ props.data.Timestamp }}</n-text>
            </div>
            <div>
                <n-text>{{ props.data.Text }}</n-text>
            </div>
        </n-card>
    </n-space>*/

</script>
<template>
    <n-card>
        <n-space vertical>
            <n-text>
                {{ props.Comment.UserName }}{{ props.Comment.Timestamp }}
            </n-text>
            <n-text>
                {{ props.Comment.Text }}
            </n-text>
        </n-space>
    </n-card>
</template>
