<template>
    <a-modal
        :visible="previewVisible"
        :footer="null"
        :centered="true"
        @cancel="() => { $emit('cancel') }"
    >
        <img v-if="previewType === 'image'" style="width: 100%" :src="previewUrl" />
        <video v-else-if="previewType === 'video'" :src="previewUrl" width="100%" controls></video>
        <embed v-else-if="previewUrl.split('.')[previewUrl.split('.').length - 1].toLowerCase() === 'pdf'" :src="previewUrl" type="application/pdf" width="100%">
        <div v-else style="text-align:center;padding: 40px 0">
            <a-icon type="frown" theme="twoTone" :style="{ 'font-size': '30px', 'margin-bottom': '10px' }" />
            <div style="margin-bottom:5px;"><small><a :href="previewUrl" target="_blank" style="color:#aaa;">{{ previewUrl }}</a></small></div>
            <div>File types that do not support preview: <span :style="{ 'font-weight': 'bold' }">{{ previewUrl.split('.')[previewUrl.split('.').length - 1] }}</span></div>
            <div v-if="uploadTime" style="font-size:13px;color:#aaa;margin-top:5px;">Upload At: {{ uploadTime }}</div>
        </div>
    </a-modal>
</template>

<script>
export default {
    name: 'PreviewModal',
    props: {
        previewVisible: {
            type: Boolean,
            required: true
        },
        previewType: {
            type: String,
            default: () => 'image'
        },
        previewUrl: {
            type: String,
            required: true
        },
        uploadTime: {
            type: String
        }
    },
    mounted () {
    },
    data () {
        return {
        }
    },
    methods: {
    }
}
</script>

<style>
.ant-modal-close-x {
    width: 30px;
    height: 30px;
    line-height: 30px;
}
</style>
