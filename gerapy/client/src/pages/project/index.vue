<template>
  <div class="panel">
    <el-dialog :visible.sync="createProjectDialog" size="tiny">
      <el-form>
        <el-form-item :label="$lang[$store.state.lang].columns.name">
          <el-input
            v-model="projectName" class="inline" :placeholder="$lang[$store.state.lang].columns.name"
            size="small">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="createProjectDialog=false" size="small">{{ $lang[$store.state.lang].buttons.cancel }}
        </el-button>
        <el-button @click="onCreateProject()"
                   type="primary" size="small">{{ $lang[$store.state.lang].buttons.create }}
        </el-button>
      </div>
    </el-dialog>
    <panel-title :title="$lang[$store.state.lang].objects.project">
      <!--创建项目按钮-->
      <el-button type="primary" size="mini" @click="createProjectDialog=true"
      style="float: right; position: relative; right: 16px; top: 8px;">
        <i class="fa fa-plus"></i>
        {{ $lang[$store.state.lang].buttons.create }}
      </el-button>

      <!--上传项目按钮-->
      <form action="api/project/upload" method="post" id="form_file" enctype="multipart/form-data">
        <input type="submit" id="submit_file" value="upload"/>
        <a href="javascript:;" class="file">select zipfile
            <input type="file" name="zipfile"/>
        </a>
      </form>
    </panel-title>
    <div class="panel-body">
      <el-table
        :data="projects"
        :empty-text="$lang[$store.state.lang].messages.noData"
        v-loading="loadData"
        :element-loading-text="$lang[$store.state.lang].messages.loading"
        @selection-change="onBatchSelect"
        style="width: 100%;">
        <el-table-column
          align="center"
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          align="center"
          prop="name"
          :label="$lang[$store.state.lang].columns.name"
          width="150">
        </el-table-column>
        <el-table-column
          align="center"
          :label="$lang[$store.state.lang].columns.description"
          width="120">
          <template scope="props">
            <span v-if="buildInfos[props.row.name]">
              {{ buildInfos[props.row.name]['description'] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          :label="$lang[$store.state.lang].columns.built"
          width="80">
          <template scope="props">
            <span v-if="buildInfos[props.row.name]">
              {{ buildInfos[props.row.name]['egg'] ? '✓' : '✗' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          :label="$lang[$store.state.lang].columns.configurable"
          width="150">
          <template scope="props">
            <span v-if="buildInfos[props.row.name]">
              {{ buildInfos[props.row.name]['configurable'] ? '✓' : '✗' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          :label="$lang[$store.state.lang].columns.builtAt"
          width="200">
          <template scope="props">
            <span v-if="buildInfos[props.row.name]">
              {{ buildInfos[props.row.name]['built_at'] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          :label="$lang[$store.state.lang].columns.operations">
          <template scope="props">
            <router-link :to="{name: 'projectConfigure', params: {name: props.row.name}}" tag="span"
                         v-if="buildInfos[props.row.name] && buildInfos[props.row.name]['configurable']">
              <el-button type="warning" size="mini">
                <i class="fa fa-edit"></i>
                {{ $lang[$store.state.lang].buttons.configure }}
              </el-button>
            </router-link>
            <router-link :to="{name: 'projectEdit', params: {name: props.row.name}}" tag="span" v-else>
              <el-button type="warning" size="mini">
                <i class="fa fa-edit"></i>
                {{ $lang[$store.state.lang].buttons.edit }}
              </el-button>
            </router-link>
            <router-link :to="{name: 'projectDeploy', params: {name: props.row.name}}" tag="span">
              <el-button type="success" size="mini">
                <i class="fa fa-cloud-upload"></i>
                {{ $lang[$store.state.lang].buttons.deploy }}
              </el-button>
            </router-link>
            <!--<router-link :to="{name: 'projectMonitor', params: {name: props.row.name}}" tag="span">-->
            <!--<el-button type="info" size="mini">-->
            <!--<i class="fa fa-podcast"></i>-->
            <!--监控-->
            <!--</el-button>-->
            <!--</router-link>-->
            <el-button type="danger" size="mini" @click="onSingleDelete(props.row.name)">
              <i class="fa fa-remove"></i>
              {{ $lang[$store.state.lang].buttons.delete }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <bottom-tool-bar>
        <el-button
          type="danger"
          icon="delete"
          size="mini"
          :disabled="batchSelect.length === 0"
          @click="onBatchDelete"
          slot="handler">
          <span>{{ $lang[$store.state.lang].buttons.batchDelete }}</span>
        </el-button>
      </bottom-tool-bar>

    </div>
  </div>

</template>
<script type="text/javascript">
  import {panelTitle, bottomToolBar} from 'components'
  export default{
    data(){
      return {
        createProjectDialog: false,
        projectName: null,
        projects: [],
        //请求时的loading效果
        loadData: false,
        //批量选择数组
        batchSelect: [],
        buildInfos: {},
        fileList: []

      }
    },
    components: {
      panelTitle,
      bottomToolBar
    },
    created(){
      this.getProjectData()
    },
    methods: {
      onBatchSelect(val){
        this.batchSelect = val
      },
      getBuildInfo(name){
        this.loadData = true
        this.$fetch.apiProject.buildInfo({
          name: name
        }).then(({data: data}) => {
          this.$set(this.buildInfos, name, data)
          this.loadData = false
        }).catch(() => {
          this.loadData = false
        })
      },
      //获取数据
      getProjectData(){
        this.loadData = true
        this.$fetch.apiProject.projectList(
        ).then(({data: projects}) => {
          this.projects = projects
          this.loadData = false
          this.projects.forEach((project) => {
            console.log(project)
            this.getBuildInfo(project.name)
          })
        }).catch((data) => {
          console.log(data)
          this.loadData = false
        })
      },
      deleteProject(name) {
        this.loadData = true
        this.$fetch.apiProject.projectRemove({
          name: name
        }).then(() => {
          this.$message.success(this.$lang[this.$store.state.lang].messages.successDelete)
          this.loadData = false
          this.getProjectData()
        }).catch((error) => {
          this.loadData = false
          this.$message.error(this.$lang[this.$store.state.lang].messages.errorDelete)
        })
      },
      // 单个删除
      onSingleDelete(name) {
        this.$confirm(this.$lang[this.$store.state.lang].messages.confirm, this.$lang[this.$store.state.lang].buttons.confirm, {
          confirmButtonText: this.$lang[this.$store.state.lang].buttons.yes,
          cancelButtonText: this.$lang[this.$store.state.lang].buttons.no,
          type: 'warning'
        }).then(() => {
          this.deleteProject(name)
        })
      },
      //批量删除
      onBatchDelete(){
        this.$confirm(this.$lang[this.$store.state.lang].messages.confirm, this.$lang[this.$store.state.lang].buttons.confirm, {
          confirmButtonText: this.$lang[this.$store.state.lang].buttons.yes,
          cancelButtonText: this.$lang[this.$store.state.lang].buttons.no,
          type: 'warning'
        }).then(() => {
          this.loadData = true
          this.batchSelect.forEach(({name: name}) => {
            this.deleteProject(name)
          })
        }).catch(() => {
          this.$message.error(this.$lang[this.$store.state.lang].messages.errorDelete)
        })
      },
      onCreateProject() {
        this.$fetch.apiProject.projectCreate({
          name: this.projectName
        }).then(() => {
          this.$message.success(this.$lang[this.$store.state.lang].messages.successSave)
          this.loadData = false
          this.$router.push({name: 'projectConfigure', params: {name: this.projectName}})
        }).catch((error) => {
          this.loadData = false
          this.$message.error(this.$lang[this.$store.state.lang].messages.errorSave)
        })
      }
    }
  };

</script>
<style type="text/css">
  #form_file {
    float: right;
    position: relative;
    right: 100px;
  }
  .file {
      position: relative;/*绝对定位!*/
      display: inline-block;/*设置为行内元素*/
      top: 8px;
      right: 6px;
      float: right;
      background: #28CCAA;
      border: 1px solid #28CCAA;
      border-radius: 4px;
      padding: 4px 6px;
      overflow: hidden;
      color: white;
      text-decoration: none;
      text-indent: 0;
      line-height: 13px;
      text-transform: none;
      font-size: 13px;
  }
  .file input {
      position: absolute;/*相对定位*/
      right: 0;
      top: 0;
      opacity: 0;/*将上传组件设置为透明的*/
      font-size: 100px;
  }
  #submit_file {
      position: relative;/*绝对定位!*/
      top: 8px;
      float: right;
      background: #28CCAA;
      border: 1px solid #28CCAA;
      border-radius: 4px;
      padding: 4px 6px;
      overflow: hidden;
      color: white;
      text-decoration: none;
      text-indent: 0;
      line-height: 13px;
      text-transform: none;
      font-size: 13px;
  }
  .file:hover, #submit_file:hover {
      background: #53D6BB;
      border-color: #53D6BB;
      text-decoration: none;
  }
</style>
