 <template>
  <div style="height:100%;width:100%;">
    <!-- name 和action是必需的，否则无法上传 -->

    <Upload ref="upload"
            multiple
            type="drag"
            action="/documents/upload_file"
            name="myfiles"
            :on-success="uploadSuccess">
      <div style="padding: 20px 0">
        <Icon type="ios-cloud-upload"
              size="52"
              style="color: #3399ff"></Icon>
        <p style="font-size:20px;">点击或拖拽文件进行上传</p>
        <span style="    display: -webkit-inline-box;">
          <Icon type="ios-checkmark-circle-outline"
                color="red"
                size="20" />
          <p style="font-size:16px;">支持多文件同时上传</p>
        </span>
      </div>
    </Upload>
    <!-- 把表格放在card卡片中，使界面更加精美 -->
    <Card class="table-card"
          title="云文件列表"
          icon="ios-cloud">
      <div>
        <div class="btn-container">
          <Row class-name="row-wrap">
            <i-col span="8">
              <Button type="primary"
                      :size="btnSize"
                      icon="ios-checkmark-circle"
                      @click="handleSelectAll(true)">全 选</Button>
              <Button icon="md-close"
                      :size="btnSize"
                      class="btn-cancel"
                      @click="handleSelectAll(false)">取消全选</Button>
            </i-col>
            <!-- 搜索框 -->
            <i-col span="8">
              <Input @on-change="handleClear"
                     search
                     enter-button
                     @on-search="handleSearch"
                     placeholder="搜索文件"
                     class="file-search-input"
                     v-model="searchValue" />

            </i-col>
            <!-- 下载删除按钮 -->
            <i-col span="8"
                   class-name="btn-right">
              <Button icon="ios-download-outline"
                      type="primary"
                      :size="btnSize"
                      class="download"
                      @click="handleDownloadDelete('下载')">下载</Button>
              <Button icon="md-trash"
                      :size="btnSize"
                      class="delete"
                      @click="handleDownloadDelete('删除')">删除</Button>

            </i-col>
          </Row>
        </div>
        <!-- table表格的容器（为了使表格居中） -->
        <div class="table-btn-container">
          <Table ref="fileList"
                 stripe
                 border
                 width='auto'
                 :columns="columns"
                 :data="insideTableData">
            <template slot-scope="{row,index}"
                      slot="import">
              <!-- i-switch开关如果双向绑定的是原数据 开关的动画会卡顿 -->
              <Tooltip content="只支持pdf或ppt文件"
                       placement="top"
                       :disabled="playPPTtype.indexOf(row.extension)!==-1">
                <i-switch v-model="row.NowStatus"
                          :true-value="trueVal"
                          :false-value="falseVal"
                          :disabled="playPPTtype.indexOf(row.extension)===-1"
                          @on-change="statusChange(index,row.NowStatus,'导入')">
                  <!-- 填坑：想让disabled的值等于表达式的值，则需要绑定disabled的形式:disabled，对vue的双向绑定又多了一份理解。 -->
                  <Icon type="md-checkmark"
                        slot="open"></Icon>
                  <Icon type="md-close"
                        slot="close"></Icon>
                </i-switch>
              </Tooltip>
            </template>
            <template slot-scope="{row,index}"
                      slot="share">
              <!-- 这里的slot-scope="{row}"只有获取行的数据，不具有修改本行的数据源的能力 -->
              <i-switch v-model="row.ShareStatus"
                        :true-value="trueVal"
                        :false-value="falseVal"
                        @on-change="statusChange(index,row.ShareStatus,'分享')">
                <Icon type="md-checkmark"
                      slot="open"></Icon>
                <Icon type="md-close"
                      slot="close"></Icon>
              </i-switch>
            </template>
          </Table>
        </div>
        <!-- 四个按钮的容器（表格下边） -->
      </div>

    </Card>
  </div>
</template>
<script>
import { getFileList, ShareOrImport, downloadBlob, DownloadOrDelete } from '@/api/file'

export default {
  name: 'file_list',
  data () {
    return {
      btnSize: 'large',
      trueVal: 1,
      falseVal: 0,
      searchValue: '',
      playPPTtype: ['pptx', 'ppsx', 'ppt', 'pps', 'potx', 'ppsm', 'pdf'],
      columns: [
        {
          //type 某一列的类型
          type: 'selection',
          width: 50,
          align: 'center'
        },
        {
          type: 'index',
          width: 70,
          //title表头名
          title: '索引',
          //key对对应一下的字段名
          align: 'center',
          className: 'tableFontSize'
        },
        {
          title: '文件名',
          key: 'file_name',
          sortable: true,
          align: 'center',
          width: 460,
          // maxWidth: 500,
          // ellipsis超出部分显示为省略号
          ellipsis: true,
          // tooltip超出一定字数的单元格用气泡提示出来
          tooltip: true,
          className: 'tableFontSize'

        },
        {
          title: '格式',
          key: 'extension',
          align: 'center',
          width: 100,
          className: 'tableFontSize',
          filters: [
            {
              label: 'pdf',
              value: 'pdf'
            },
            {
              label: 'ppt',
              value: 'ppt'
            },
            {
              label: 'docx',
              value: 'docx'
            },
            {
              label: 'xlsx',
              value: 'xlsx'
            },
            {
              label: 'png',
              value: 'png'
            },
            {
              label: 'jpg',
              value: 'jpg'
            }
          ],
          filterMethod (value, row) {
            return row.extension === value
          }
        },
        {
          title: '下载量',
          sortable: true,
          key: 'download_num',
          align: 'center',
          width: 105,
          className: 'tableFontSize',
          render: (h, params) => {
            return h('Tooltip', {
              props: {
                content: '学生下载此文件的人数',
                placement: 'top'
              }
            }, params.row.download_num)
          },
        },
        {
          title: '导入',
          key: 'NowStatus',
          slot: 'import',
          align: 'center',
          width: 80,
          className: 'tableFontSize',
        },
        {
          title: '分享',
          key: 'ShareStatus',
          slot: 'share',
          align: 'center',
          sortable: true,
          maxWidth: 90,
          className: 'tableFontSize',

        }
      ],
      fileData: [],
      insideTableData: [],
    }
  },
  mounted () {
    // 请求后台获取文件列表
    this.handleGetFileList()
  },
  activated () {
    this.handleGetFileList()
  },
  methods: {
    handleGetFileList () {
      getFileList().then(res => {
        const message = res.message
        const status = res.status
        if (status === 200) {
          this.fileData = res.file_info
          for (let index in this.fileData) {
            let extension = this.fileData[index].file_name_uuid.split('.').pop()
            this.fileData[index]['extension'] = extension
          }
          this.insideTableData = this.fileData
        } else {
          this.$Modal.error({
            title: '文件列表获取失败！',
            content: '原因：' + message
          })
        }
      }).catch(error => {
        this.$Modal.error({
          title: '文件列表获取失败！',
          content: error
        })
      })
    },
    handleSelectAll (status) {
      this.$refs.fileList.selectAll(status);
    },
    // 成功上传文件后的钩子，返回response, file, fileList
    uploadSuccess (response, file, fileList) {
      this.$Notice.success({
        title: file.name + "上传成功！",
        duration: 3
      })
      let fileName = file.name.split('.')
      this.fileData.push({
        file_name: fileName[0],
        extension: fileName[fileName.length - 1],
        file_name_uuid: response.file_name_uuid,
        ShareStatus: 0,
        NowStatus: 0
      })
    },

    // 分享和取消分享成功或失败、导入和取消导入成功或失败的提示信息
    share_import_change ({ ResponseStatus, ResponseMessage, statusType, status, file_name }) {
      if (ResponseStatus === 200) {
        if (status === 0) {
          this.$Notice.success({
            title: '取消' + statusType,
            desc: "文件——“" + file_name + "”" + '——已取消' + statusType + '!',
            duration: 6
          })
        } else {
          this.$Notice.success({
            title: '文件' + statusType,
            desc: "文件——“" + file_name + "”" + '——' + statusType + '成功！',
            duration: 6
          })
        }
      } else {
        if (status === 0) {
          this.$Notice.error({
            title: '取消' + statusType + '失败！',
            desc: ResponseMessage
            // desc: "文件——“" + file_name + "”" + '——取消' + statusType + '失败！' + '<br>失败原因：' + ResponseMessage
          })
        } else {
          this.$Notice.error({
            title: '文件' + statusType + '失败！',
            desc: ResponseMessage
            // desc: "文件——“" + file_name + "”" + '——' + statusType + '失败！' + '<br>失败原因：' + ResponseMessage
          })
        }
      }
    },
    //导入和分享按钮的响应
    statusChange (index, status, statusType) {
      console.log(index)
      let file_name_uuid = this.fileData[index].file_name_uuid
      let file_name = this.fileData[index].file_name
      console.log(file_name + statusType + '：' + status)
      ShareOrImport({
        statusType: statusType,
        file_name_uuid: file_name_uuid,
        status: status
      }).then(res => {
        this.share_import_change(
          {
            ResponseStatus: res.status,
            ResponseMessage: res.message,
            status: status,
            statusType: statusType,
            file_name: file_name
          })
      }).catch(error => {
        this.$Modal.error({
          title: '异常',
          content: error
        })
      })
    },
    // 对下载和删除成功或失败的提示消息
    DownloadDeleteMessage ({ res, type, index, file_name_uuid, file_name, extension }) {
      if (type === '下载') {
        if ("status" in res) {
          this.$Notice.error({
            title: file_name + "——下载失败！"
          })
          this.handleSelectAll(false)
        } else {
          let file = file_name + '.' + extension
          downloadBlob(res, file)
          this.handleSelectAll(false)
        }
      } else {
        if (res.status === 200) {
          this.fileData.splice(index, 1)
          this.$Notice.success({
            title: "成功删除文件“" + file_name + "”"
          })
        } else {
          this.$Notice.error({
            title: file_name + "——删除失败！"
          })
          this.handleSelectAll(false)
        }

      }
    },
    // 批量下载和批量删除
    handleDownloadDelete (type) {
      let selection = this.$refs.fileList.getSelection()
      if (selection.length) {
        if (type === '删除') {
          this.$Modal.confirm({
            closable: true,
            title: '删除确认',
            content: '删除文件之后，不可修复，您确定要删除吗？',
            onOk: () => {
              for (let file of selection) {
                // 获取数组对象中值等于selection中的file_name_uuid的索引
                let index = this.fileData.findIndex(document => document.file_name_uuid === file.file_name_uuid)
                DownloadOrDelete({
                  type: type,
                  file_name_uuid: file.file_name_uuid
                }).then(res => {
                  this.DownloadDeleteMessage({
                    res: res,
                    type: type,
                    index: index,
                    file_name_uuid: file.file_name_uuid,
                    file_name: file.file_name,
                    extension: file.extension
                  })
                }).catch(error => {
                  this.$Modal.error({ title: error })
                })

              }
            }
          })
        } else {
          for (let file of selection) {
            // 获取数组对象中值等于selection中的file_name_uuid的索引
            let index = this.fileData.findIndex(document => document.file_name_uuid === file.file_name_uuid)
            DownloadOrDelete({
              type: type,
              file_name_uuid: file.file_name_uuid
            }).then(res => {
              this.DownloadDeleteMessage({
                res: res,
                type: type,
                index: index,
                file_name_uuid: file.file_name_uuid,
                file_name: file.file_name,
                extension: file.extension
              })
            }).catch(error => {
              this.$Modal.error({ title: error })
            })
          }
        }
      } else {
        this.$Modal.warning({
          title: '请选择要' + type + '的文件！'
        })
      }
    },
    handleClear (e) {
      if (e.target.value === '') this.insideTableData = this.fileData
    },
    handleSearch () {
      this.insideTableData = this.fileData.filter(item => item.file_name.indexOf(this.searchValue) > -1)
    },
  },
}
</script>
<style lang="less">
.table-card {

  padding-bottom: 30px;
}
.tableFontSize {
  font-size: 16px;
}
.two-btn-wrap {
  display: -webkit-flex;
  display: flex;
  width: 200px;
  justify-content: space-between;
  -moz-justify-content: space-between;
  -ms-justify-content: space-between;
  -o-justify-content: space-between;
}
.btn-wrap {
  width: 956px;
}
.select-btn {
  float: left;
  width: 220px;
}
.download-delete-btn {
  float: right;
  width: 200px;
}

.btn-container,
.table-btn-container {
  display: -webkit-box;
  display: -ms-flexbox;
  -webkit-justify-content: center;
  -moz-justify-content: center;
  -ms-justify-content: center;
  -o-justify-content: center;
  justify-content: center;
  align-items: center;
}
.file-search-input {
  width: 100%;
  height: 100%;
}
.file-search-btn {
  margin-left: 3px;
}
.row-wrap {
  width: 956px;
  padding-bottom: 10px;
  .btn-cancel {
    margin-left: 20px;
  }
  .btn-right {
    .delete {
      float: right;
      margin-right: 20px;
    }
    .download {
      float: right;
    }
  }
}
</style>
