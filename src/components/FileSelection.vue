<template>
    <div>
        <div class="file-container">
            <div v-for="(item, index) in files" :key="index" class="file-item-wrapper">
                <div class="file-item">
                    <div class="item-info">
                        <img v-if="item.type === 'image'" :src="item.url + '?x-oss-process=image/resize,w_200,limit_0'">
                        <!-- <a-icon v-else-if="item.type === 'video'" type="play-square" theme="twoTone" class="file-icon" /> -->
                        <video v-else-if="item.type === 'video'" :src="item.url" width="100%" style="vertical-align:middle" />
                        <a-icon v-else type="file" theme="twoTone" class="file-icon" />
                    </div>
                    <div class="item-actions">
                        <a href="javascript:;" class="icon-item" @click="previewItem(item)"><a-icon type="eye" /></a>
                        <a v-show="!disabled" href="javascript:;" class="icon-item" @click="deleteItem(index)"><a-icon type="delete" /></a>
                    </div>
                </div>
            </div>
            <div v-show="(max !== null && max > files.length) && !disabled" class="file-item-wrapper select-files-button" @click="managerShow">
                <a-icon type="plus" class="icon-item" />
                <div>{{ title }}</div>
            </div>
        </div>
        <PreviewModal
            :previewVisible="previewVisible"
            :previewName="previewName"
            :previewType="previewType"
            :previewUrl="previewUrl"
            :uploadTime="uploadTime"
            @cancel="closePreview"
        >
        </PreviewModal>
        <FileManager
            ref="manager"
            :config="config"
            :visible="managerVisible"
            :selecting="true"
            :max="max - files.length"
            :types="types"
            :crop="crop"
            :cropWidth="cropWidth"
            :cropHeight="cropHeight"
            @ok="managerOk"
            @cancel="managerClose"
        >
        </FileManager>
    </div>
</template>

<script>
import PreviewModal from './PreviewModal'
import FileManager from './FileManager'
import cloneDeep from 'lodash.clonedeep'

export default {
    name: 'FileSelection',
    components: {
        FileManager,
        PreviewModal
    },
    props: {
        config: {
            type: Object,
            requird: true
        },
        title: {
            type: String,
            default: () => 'Image/Video'
        },
        files: {
            type: Array,
            default: () => []
        },
        max: {
            type: Number,
            default: () => null
        },
        disabled: {
            type: Boolean,
            default: () => false
        },
        types: {
            type: Array,
            default: () => []
        },
        crop: {
            type: Boolean,
            default: () => false
        },
        cropWidth: {
            type: Number,
            default: () => 200
        },
        cropHeight: {
            type: Number,
            default: () => 200
        }
    },
    data () {
        return {
            previewVisible: false,
            previewName: '',
            previewType: '',
            previewUrl: '',
            uploadTime: '',
            managerVisible: false
        }
    },
    methods: {
        previewItem (item) {
            this.previewName = item.name
            this.previewUrl = item.url
            this.previewType = item.type
            this.uploadTime = item.time
            this.previewVisible = true
        },
        deleteItem (index) {
            const files = cloneDeep(this.files)
            files.splice(index, 1)
            this.files = files
            this.$emit('updateList', this.files)
        },
        closePreview () {
            this.previewVisible = false
        },
        managerShow () {
            this.managerVisible = true
            this.$refs.manager.getFileList()
        },
        managerOk (data) {
            data.forEach(item => {
               this.files.push(item)
            })
            this.managerVisible = false
            this.$emit('updateList', this.files)
        },
        managerClose () {
            this.managerVisible = false
        }
    }
}
</script>

<style scoped>
    .file-container::after {
        content: '';
        display: block;
        clear: both;
    }
    .file-container > .file-item-wrapper {
        position: relative;
        float: left;
        width: 104px;
        height: 104px;
        margin: 0 8px 8px 0;
        padding: 8px;
        border: 1px solid #d9d9d9;
        border-radius: 2px;
        cursor: pointer;
    }
    .file-container > .file-item-wrapper > .file-item,
    .file-container > .file-item-wrapper > .file-item > .item-info {
        position: relative;
        height: 100%;
        overflow: hidden;
    }
    .file-container > .file-item-wrapper > .file-item > .item-info {
        line-height: 86px;
    }
    .file-container > .file-item-wrapper > .file-item > .item-info > img {
        position: static;
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .file-container > .file-item-wrapper > .file-item > .item-info > .file-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        font-size: 26px;
        transform: translate(-50%, -50%);
    }
    .file-container > .file-item-wrapper > .file-item::before {
        content: '';
        opacity: 0;
        position: absolute;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        -webkit-transition: all 0.3s;
        transition: all 0.3s;
        z-index: 1;
    }
    .file-container > .file-item-wrapper > .file-item > .item-actions {
        opacity: 0;
        position: absolute;
        top: 50%;
        left: 50%;
        white-space: nowrap;
        -webkit-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        -webkit-transition: all 0.3s;
        transition: all 0.3s;
        z-index: 10;
    }
    .file-container > .file-item-wrapper > .file-item > .item-actions > .icon-item {
        width: 30px;
        margin: 0 4px;
        color: rgb(115, 192, 64);
        font-size: 30px;
        -webkit-transition: all 0.3s;
        transition: all 0.3s;
        z-index: 10;
    }
    .file-container > .file-item-wrapper > .file-item > .item-actions > .icon-item {
        width: 16px;
        font-size: 16px;
        color: rgba(255, 255, 255, .85);
    }
    .file-container > .file-item-wrapper:hover > .file-item > .item-actions > .icon-item {
        color: rgba(255, 255, 255, 1);
    }
    .file-container > .file-item-wrapper:hover > .file-item::before,
    .file-container > .file-item-wrapper:hover > .file-item > .item-actions {
        opacity: 1;
    }
    .select-files-button {
        padding-top: 20px!important;
        line-height: 30px;
        text-align: center;
        color: #999;
        -webkit-transition: all 0.3s;
        transition: all 0.3s;
    }
    .select-files-button:hover {
        color: skyblue;
        border-color: skyblue;
    }
    .select-files-button > .icon-item {
        font-size: 30px;
    }
</style>
