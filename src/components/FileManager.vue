<template>
    <a-modal
        title="上传管理"
        :width="832"
        :visible="visible"
        :centered="true"
        @cancel="() => { this.$emit('cancel') }"
        :destroyOnClose="true"
    >
        <a-spin :spinning="loading">
            <div style="margin-bottom:15px;">
                <a-upload-dragger
                    name="files"
                    :accept="fileAccept"
                    :multiple="true"
                    :file-list="[]"
                    :beforeUpload="beforeUpload"
                    @change="handleUpload"
                >
                    <p class="ant-upload-drag-icon"><a-icon type="inbox" /></p>
                    <p class="ant-upload-text">Click or drag file to this area to upload</p>
                </a-upload-dragger>
            </div>
            <div v-show="files.length === 0" style="padding: 20px 0;"><a-empty /></div>
            <div v-show="files.length > 0" class="select-wrapper">
                <div class="left-wrapper">
                    <span>选中：{{ selected.length }} / {{ files.length }}</span>
                    <a href="javascript:;" v-show="selecting && selected.length !== files.length" @click="selectAll">全选</a>
                    <a href="javascript:;" v-show="!selecting" @click="() => { selecting = true }">选择</a>
                    <a href="javascript:;" v-show="selecting" @click="() => { selected = []; selecting = false }">取消</a>
                </div>
                <div v-show="selected.length > 0" class="right-wrapper">
                    <a-popconfirm
                        v-show="selecting"
                        title="Are you sure delete these files?"
                        ok-text="Yes"
                        cancel-text="No"
                        @confirm="handleDelete"
                    >
                        <a href="javascript:;" class="icon-item" style="color:red"><a-icon type="delete" style="margin-right:3px" />删除</a>
                    </a-popconfirm>
                </div>
            </div>
            <div v-show="files.length > 0" :class="'file-container' + (selecting ? ' selecting' : '')">
                <div v-for="(item, index) in files" :key="index" class="file-item-wrapper">
                    <div :class="'file-item' + (selected.indexOf(index) !== -1 ? ' selected' : '')" @click="clickItem(item, index)">
                        <div class="item-info">
                            <img v-if="item.type === 'image'" :src="item.url + '?x-oss-process=image/resize,w_200,limit_0'">
                            <video v-else-if="item.type === 'video'" :src="item.url" width="100%" style="vertical-align:middle" />
                            <!-- <a-icon v-else-if="item.type === 'video'" type="play-square" theme="twoTone" class="file-icon" /> -->
                            <a-icon v-else type="file" theme="twoTone" class="file-icon" />
                        </div>
                        <div class="item-select">
                            <a-icon class="icon-item" type="check-circle" theme="filled" />
                        </div>
                        <div class="item-actions">
                            <a href="javascript:;" class="icon-item"><a-icon type="eye" /></a>
                        </div>
                    </div>
                </div>
            </div>
            <div style="text-align:right;margin-top:10px">
                <a-pagination
                    :defaultCurrent="currentPage"
                    :total="totalCount"
                    :defaultPageSize="pageSize"
                    @change="pageChange"
                />
            </div>
            <preview-modal
                :previewVisible="previewVisible"
                :previewType="previewType"
                :previewUrl="previewUrl"
                :uploadTime="uploadTime"
                @cancel="closePreview"
            >
            </preview-modal>
        </a-spin>
        <template slot="footer">
            <template>
                <a-button key="submit" type="primary" :disabled="!selecting || selected.length === 0" @click="selectFiles">确认选择</a-button>
            </template>
        </template>

        <a-modal
            title="裁剪"
            :visible="cropperVisible"
            :maskClosable="false"
            :confirmLoading="confirmLoading"
            :width="cropWidth <= 375 ? 425 : (cropWidth + 50)"
            :footer="null"
            @cancel="cancelHandel">
            <a-row>
                <a-col :xs="24" :md="24" :style="{height: '350px'}">
                    <vue-cropper
                        ref="cropper"
                        :img="options.img"
                        :info="true"
                        :autoCrop="options.autoCrop"
                        :autoCropWidth="cropWidth"
                        :autoCropHeight="cropHeight"
                        :fixedBox="options.fixedBox"
                    >
                    </vue-cropper>
                </a-col>
            </a-row>
            <br>
            <a-row>
                <a-col :lg="{span: 1, offset: 2}" :md="2">
                    <a-button icon="plus" @click="changeScale(1)" :loading="cropLoading" />
                </a-col>
                <a-col :lg="{span: 1, offset: 1}" :md="2">
                    <a-button icon="minus" @click="changeScale(-1)" :loading="cropLoading" />
                </a-col>
                <a-col :lg="{span: 1, offset: 1}" :md="2">
                    <a-button icon="undo" @click="rotateLeft" :loading="cropLoading" />
                </a-col>
                <a-col :lg="{span: 1, offset: 1}" :md="2">
                    <a-button icon="redo" @click="rotateRight" :loading="cropLoading" />
                </a-col>
                <a-col :lg="{span: 2, offset: 6}" :md="2">
                    <a-button type="primary" @click="finish('blob')" :loading="cropLoading">OK</a-button>
                </a-col>
            </a-row>
        </a-modal>

    </a-modal>
</template>

<script>
import PreviewModal from './PreviewModal'
import { VueCropper } from 'vue-cropper'
import storage from 'store'

export default {
    name: 'FileManager',
    components: {
        PreviewModal,
        VueCropper
    },
    props: {
        config: {
            type: Object,
            default: () => {
                return {
                    getApi: String,
                    saveApi: String,
                    deleteApi: String
                }
            }
        },
        visible: {
            type: Boolean,
            required: true
        },
        selecting: {
            type: Boolean,
            default: () => false
        },
        max: {
            type: Number,
            default: () => null
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
            previewType: '',
            previewUrl: '',
            uploadTime: '',
            files: [],
            selected: [],
            fileAccept: '*',
            cropperVisible: false,
            confirmLoading: false,
            uploading: {},
            options: {
                img: '',
                autoCrop: true,
                fixedBox: true,
                infoTrue: true
            },
            cropLoading: false,
            currentPage: 1,
            totalCount: 0,
            pageSize: 21,
            cutting: [],
            loading: false
        }
    },
    created () {
        if (this.types.length > 0) {
            let accept = ''
            this.types.forEach(item => {
                if (item === 'image') {
                    accept += 'image/jpg,image/jpeg,image/png,'
                } else if (item === 'video') {
                    accept += 'video/mp4,video/avi,video/mov,'
                }
            })
            this.fileAccept = accept
        }
    },
    methods: {
        getFileList () {
            this.loading = true
            this.$axios.get(this.config.getApi,
                {
                    types: this.types,
                    pageSize: this.pageSize,
                    pageNo: this.currentPage
                }, {
                    headers: {
                        Authorization: storage.get(ACCESS_TOKEN)
                    }
                }
            ).then(res => {
                this.files = res.data.result.data
                this.totalCount = res.data.result.totalCount
                this.loading = false
            }).catch(err => {
                this.$message.error(err.message)
            })
        },
        closePreview () {
            this.previewVisible = false
        },
        beforeUpload (file) {
            if (this.crop) {
                const reader = new FileReader()
                // 把Array Buffer转化为blob 如果是base64不需要
                // 转化为base64
                reader.readAsDataURL(file)
                reader.onload = () => {
                    this.cutting.push(reader.result)
                    if (!this.cropperVisible) {
                        this.options.img = reader.result
                        this.cropperVisible = true
                    }
                }
            }

            return false
        },
        handleUpload (data) {
            if (!this.crop) {
                this.uploadFile(data)
            }
        },
        uploadFile (data) {
            if (JSON.stringify(this.uploading) === '{}' || !this.uploading) {
                this.uploading = this.$message.loading('上传中...请勿关闭窗口', 0)
            }
            this.cropLoading = true
            if (this.crop) {
                this.upload(data)
            } else {
                this.upload(data.file)
            }
        },
        upload (file) {
            const params = new FormData()
            params.append('files[]', file)
            this.$axios.post(this.config.saveApi, params, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: storage.get(ACCESS_TOKEN)
                }
            }).then(res => {
                console.log(res);
                if (res.status === 200) {
                    this.getFileList()
                    this.$message.config({ maxCount: 1 })
                    this.$message.success(res.data.message)
                    if (this.crop) {
                        this.cutting.splice(0, 1)
                    }
                    if (this.cutting.length > 0) {
                        this.options.img = this.cutting[0]
                    } else {
                        this.options.img = ''
                        this.cropperVisible = false
                    }
                }
            }).catch(err => {
                this.$message.error(err.message)
            }).finally(() => {
                this.uploading()
                this.cropLoading = false
            })
        },
        handleDelete () {
            const ids = []
            this.selected.forEach(item => {
                ids.push(this.files[item].id)
            })
            this.$axios.post(this.config.deleteApi, { ids: ids }, {
                headers: {
                    Authorization: storage.get(ACCESS_TOKEN)
                }
            }).then(res => {
                this.getFileList()
                this.selected = []
                this.$message.success(res.data.message)
            })
        },
        clickItem (item, key) {
            if (this.selecting) {
                const index = this.selected.indexOf(key)
                if (index === -1) {
                    if (this.max !== null && this.max > this.selected.length) {
                        this.selected.push(key)
                    } else {
                        this.$message.error('最多可选择' + this.max + '个文件')
                    }
                } else {
                    this.selected.splice(index, 1)
                }
            } else {
                this.previewUrl = item.url
                this.previewType = item.type
                this.uploadTime = item.time
                this.previewVisible = true
            }
        },
        selectAll () {
            const arr = []
            for (let i = 0; i < Math.min(this.files.length, this.max); i++) {
                arr.push(i)
            }
            this.selected = arr
        },
        selectFiles () {
            const arr = []
            this.selected.forEach(item => {
                arr.push(this.files[item])
            })
            this.selected = []
            this.$emit('ok', arr)
        },
        close () {
            this.id = null
            this.cropperVisible = false
            this.cutting = []
        },
        cancelHandel () {
            this.close()
        },
        changeScale (num) {
            num = num || 1
            this.$refs.cropper.changeScale(num)
        },
        rotateLeft () {
            this.$refs.cropper.rotateLeft()
        },
        rotateRight () {
            this.$refs.cropper.rotateRight()
        },

        // 上传图片（点击上传按钮）
        finish (type) {
            // 输出
            if (type === 'blob') {
                this.$refs.cropper.getCropBlob((data) => {
                    console.log(data)
                    const img = window.URL.createObjectURL(data)
                    this.model = true
                    this.modelSrc = img
                    data.name = 'xxx.jpg'
                    this.uploadFile(data)
                })
            }
        },
        okHandel () {
            const vm = this

            vm.confirmLoading = true
            setTimeout(() => {
                vm.confirmLoading = false
                vm.close()
                vm.$message.success('上傳成功')
            }, 2000)
        },
        pageChange (page, pageSize) {
            this.currentPage = page
            this.loading = true
            this.getFileList()
        }
    }
}
</script>

<style scoped>
    .file-container::after,
    .select-wrapper::after {
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
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        -webkit-transition: all 0.3s;
        transition: all 0.3s;
        z-index: 1;
    }
    .file-container > .file-item-wrapper > .file-item > .item-select,
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
    .file-container > .file-item-wrapper > .file-item > .item-select > .icon-item,
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
    .file-container.selecting > .file-item-wrapper > .file-item.selected::before,
    .file-container.selecting > .file-item-wrapper > .file-item.selected > .item-select,
    .file-container > .file-item-wrapper:hover > .file-item::before,
    .file-container.selecting > .file-item-wrapper:hover > .file-item > .item-select,
    .file-container:not(.selecting) > .file-item-wrapper:hover > .file-item > .item-actions {
        opacity: 1;
    }
    .select-wrapper {
        margin-bottom: 15px;
        font-size: 13px;
    }
    .select-wrapper > .left-wrapper {
        float: left;
    }
    .select-wrapper > .left-wrapper > a {
        margin-left: 8px;
    }
    .select-wrapper > .right-wrapper {
        float: right;
    }
</style>
