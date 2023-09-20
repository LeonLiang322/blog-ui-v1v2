<script setup>
import {onMounted, reactive, ref} from "vue";
import {usePagination, useRequest} from "vue-request";
import req from "@/utils/handleReq";
import store from "@/store";
import {api} from "v-viewer";

// ---------------------------------- Services & APIs ----------------------------------
const checkTitleService = async v => {
  const result = await req.sys.get('/articles/check-title', { title: v });
  return result.data.data;
}
const checkFileService = async v => {
  const result = await req.sys.get('/articles/check-filename', { filename: v });
  return result.data.data;
}
const getTagsService = async () => {
  const result = await req.sys.get('/tags/list');
  return result.data.data;
}
const imgUploadService = async v => {
  const result = await req.pic.post('/upload', v);
  return result.data.data;
}
const imgDeleteService = async v => {
  const result = await req.pic.delete('/images/' + v);
  return result.data.data;
}
const articleUploadService = async v => {
  const result = await req.sys.post('/articles', v);
  return result.data.data;
}
const getArticlesService = async () => {
  const result = await req.sys.get('/articles', { page: current.value, size: 10 });
  return result.data.data;
}
const getArticleService = async id => {
  const result = await req.sys.get('/articles/' + id);
  return result.data.data;
}
const deleteArticleService = id => {
  return req.sys.delete('/articles/' + id);
}
const getArticleTKeyService = async id => {
  const result = await req.sys.get('/articles/tKey/' + id);
  return result.data.data;
}
const editArticleService = async v => {
  const result = await req.sys.patch('/articles', v);
  return result.data.data;
}

// 分页获取文章
const {
  data: articles,
  current,
  totalPage,
  loading: getArticlesLoading,
  changeCurrent
} = usePagination(getArticlesService, {
  pagination: {
    currentKey: 'current',
    totalPageKey: 'pages'
  },
  onSuccess: () => {
    // panels.value = null;
    window.scrollTo(0, 0);
    sessionStorage.setItem('a_a_current', current.value.toString());
  }
});
current.value = JSON.parse(sessionStorage.getItem('a_a_current'));

// 自动获取所有标签
const {
  data: allTags,
} = useRequest(getTagsService, {
  manual: false,
});

// 检查文章文件是否已上传
const {
  data: fileExist,
  loading: fileExistLoading,
  runAsync: fileExistRun
} = useRequest(checkFileService, {
  defaultParams: [''],
});

// 防抖检查文章标题是否存在
const {
  data: titleExist,
  loading: titleExistLoading,
  runAsync: titleExistRun
} = useRequest(checkTitleService, {
  defaultParams: [''],
  debounceInterval: 1000,
});

// 上传预览图至图床
const {
  data: tUploaded,
  runAsync: imgUploadRun
} = useRequest(imgUploadService, {
  defaultParams: [new FormData()],
});

// 删除图床预览图
const {
  data: tDeleted,
  runAsync: imgDeleteRun
} = useRequest(imgDeleteService, {
  defaultParams: [0],
});

// 上传文章
const {
  data: aUploaded,
  runAsync: articleUploadRun
} = useRequest(articleUploadService, {
  defaultParams: [{}],
});

// 根据ID获取文章
const {
  data: articleDetail,
  runAsync: getArticleRun,
  loading: getArticleLoading,
} = useRequest(getArticleService, {
  defaultParams: [null],
});

// 编辑文章
const {
  data: aUpdated,
  runAsync: editRun,
} = useRequest(editArticleService, {
  defaultParams: [{}],
});

// 删除文章
const {
  data: aDeleted,
  runAsync: deleteRun,
} = useRequest(deleteArticleService, {
  defaultParams: [0],
});

// 获取文章TKey
const {
  data: tKey,
  runAsync: getTKeyRun,
  loading: getTKeyLoading
} = useRequest(getArticleTKeyService, {
  defaultParams: [0],
});


// ---------------------------------- 通用变量 ----------------------------------
const panels = ref();
const aFile = ref([]);
const dialog = ref(false);
const loadingDialog = ref({
  visible: false,
  loading: true,
  text: '',
  color: 'white'
});
const tab = ref([0]);
const html = ref();
const uploadForm = ref();
const title = ref();
const subtitle = ref();
const tagIds = ref([]);
const tagSearch = ref();
const thumbnail = ref();
const thumbnailUrl = ref();
const titleRules = [
  v => !!v || '标题不可为空',
  v => (v && v.length <= 20) || '标题不可超过20字',
  v => handleTitleInput(v),
];
const tagRules = [
  v => (!v || v.length <= 8) || '标签不可超过8个',
  v => handleTagInput(v),
];
// 标题输入时执行检查
const handleTitleInput = async (value) => {
  if (editId.value && value === articleDetail.value.title) return true;
  await titleExistRun(value);
  return titleExist.value ? '标题已存在' : true;
}
// 禁止Vuetify自动添加新标签
const handleTagInput = value => {
  if (typeof value[value.length - 1] !== 'number') value.pop();
  return true;
}
// 重置上传表单
const resetUploadForm = () => {
  uploadForm.value.reset();
  thumbnail.value = null;
  thumbnailUrl.value = null;
}
// 重置或取消上传
const resetUpload = () => {
  dialog.value = false;
  resetUploadForm();
  tab.value = [0];
  html.value = null;
  tagSearch.value = null;
  thumbnail.value = null;
  thumbnailUrl.value = null;
  aFile.value = [];
  editId.value = null;
}
// 使用上传文件框时
const handleUpload = async () => {
  await fileExistRun(aFile.value[0].name);
  if (fileExist.value) {
    aFile.value = null;
    await store.dispatch('snackbar/openSnackbar', {
      msg: '该文章已上传',
      type: 'warning'
    });
  } else {
    // 将内容赋给html
    const reader = new FileReader();
    reader.onload = () => { html.value = reader.result }
    reader.readAsText(aFile.value[0]);
    // 将文件名预设为Title
    const filename = aFile.value[0].name;
    title.value = filename.substring(0, filename.lastIndexOf("."))
    dialog.value = true;
  }
}
// 上传更新文章时
const handleReUpload = () => {
  if (aFile.value[0].name === articleDetail.value.filename) {
    store.dispatch('snackbar/openSnackbar', {
      msg: '文章预览已更新',
      type: 'success'
    });
    // 将内容赋给html
    const reader = new FileReader();
    reader.onload = () => { html.value = reader.result }
    reader.readAsText(aFile.value[0]);
  } else {
    aFile.value = null;
    store.dispatch('snackbar/openSnackbar', {
      msg: '文件名需与源文件一致',
      type: 'warning'
    });
  }
}
// 封面
const handleUploadThumbnail = () => {
  if (thumbnail.value[0]) thumbnailUrl.value = URL.createObjectURL(thumbnail.value[0]);
}
const handleUploadSubmit = async () => {
  loadingDialog.value.visible = true;
  loadingDialog.value.text = '正在进行表单验证...';
  const { valid } = await uploadForm.value.validate();
  if (valid) {
    // 初始化表单数据
    const data = {
      title: title.value,
      subtitle: subtitle.value ? subtitle.value : '',
    }
    // 如果当前为更新操作
    if (editId.value) {
      data.id = editId.value;
      // 如果需要更新文章
      if (aFile.value[0]) data.content = html.value;
      // 如果需要更新封面图
      if (thumbnail.value) {
        // 当存在旧封面图时执行删除
        if (tKey.value) {
          loadingDialog.value.text = '正在删除旧封面...';
          await imgDeleteRun(tKey.value)
        }
        // 若不存在旧封面图 或 旧封面图已删除
        if (tKey.value === null || tDeleted.value) {
          loadingDialog.value.text = '正在上传封面...'
          const formData = new FormData();
          formData.append('file', thumbnail.value[0]);
          formData.append('album_id', 4);
          await imgUploadRun(formData);
          // 表单数据添加封面信息
          data.thumbnail = tUploaded.value?.links?.url;
          data.tKey = tUploaded.value?.key;
        } else {
          loadingDialog.value.text = '封面替换失败';
        }
      }
      // 检查标签是否有变化
      if (JSON.stringify(tagIds.value) !== JSON.stringify(articleDetail.value.tagIds)) data.tagIds = tagIds.value;
      loadingDialog.value.text = '正在更新文章...'
      await editRun(data);
      await store.dispatch('snackbar/openSnackbar', {
        msg: aUpdated.value ? '文章更新成功': '文章更新失败',
        type: aUpdated.value ? 'success': 'error'
      });
    } else {
      // 当前为上传新文章操作
      if (thumbnail.value) {
        loadingDialog.value.text = '正在上传封面...'
        const formData = new FormData();
        formData.append('file', thumbnail.value[0]);
        formData.append('album_id', 4);
        await imgUploadRun(formData);
        // 表单数据添加封面信息
        data.thumbnail = tUploaded.value?.links?.url;
        data.tKey = tUploaded.value?.key;
      }
      data.content = html.value;
      data.tagIds = tagIds.value;
      data.filename = aFile.value[0]?.name;
      loadingDialog.value.text = '正在上传文章...'
      await articleUploadRun(data);
      await store.dispatch('snackbar/openSnackbar', {
        msg: aUploaded.value ? '文章上传成功': '文章上传失败',
        type: aUploaded.value ? 'success': 'error'
      });
    }
    loadingDialog.value.visible = false;
    resetUpload();
    changeCurrent(current.value);
  } else {
    loadingDialog.value.text = '表单验证失败';
    loadingDialog.value.loading = false;
    setTimeout(() => {
      loadingDialog.value.visible = false;
    }, 1000);
  }
}

// ---------------------------------- 文章更新 ----------------------------------
const editId = ref(null);

// watch(panels, (newValue, oldValue) => {
//   if (newValue !== undefined) {
//     console.log(newValue);
//   }
// })

const handleEdit = async id => {
  await getArticleRun(id);
  const v = articleDetail.value;
  title.value = v.title;
  subtitle.value = v.subtitle;
  tagIds.value.push(...v.tags.map(tag => tag.id));
  thumbnailUrl.value = v.thumbnail;
  html.value = v.content;
  tKey.value = v.tKey;
  editId.value = id;
  dialog.value = true;
}

// ---------------------------------- 文章删除 ----------------------------------
const deleteDialog = ref(false);
const deleteArticle = ref({});
const onDelete = async v => {
  await getTKeyRun(v.id);
  deleteArticle.value.id = v.id;
  deleteArticle.value.title = v.title;
  deleteArticle.value.tKey = tKey.value;
  deleteDialog.value = true;
}

const onDeleteCancel = () => {
  deleteDialog.value = false;
  setTimeout(() => {
    deleteArticle.value = {};
  }, 500)
}

const handleDelete = async () => {
  deleteDialog.value = false;
  loadingDialog.value.visible = true;
  loadingDialog.value.text = '正在删除文章...'
  await deleteRun(deleteArticle.value.id);
  if (aDeleted && deleteArticle.value?.tKey) {
    loadingDialog.value.text = '正在删除封面...'
    await imgDeleteRun(deleteArticle.value.tKey);
  }
  await store.dispatch('snackbar/openSnackbar', {
    msg: aDeleted.value ? '文章删除成功': '文章删除失败',
    type: aDeleted.value ? 'success': 'error'
  });
  if (!tDeleted) {
    setTimeout(() => {
      store.dispatch('snackbar/openSnackbar', {
        msg: '封面图删除失败，请检查图床',
        type: 'error'
      });
    }, 1000)
  }
  loadingDialog.value.visible = false;
  deleteArticle.value = {};
  changeCurrent(current.value);
}

onMounted(() => {
  document.title = "管理 | 文章"
})
</script>

<template>
<div>
  <v-file-input
      v-model="aFile"
      :loading="fileExistLoading"
      accept="text/html"
      show-size
      clearable
      label="上传文章文件"
      prepend-icon="mdi-file"
      v-on:change="handleUpload"/>
  <v-dialog
      v-model="deleteDialog"
      width="auto">
    <v-card>
      <v-card-text class="text-center">
        <v-icon class="mb-2" color="warning" size="60">mdi-alert-box</v-icon>
        <p>
          确定要 <span class="text-warning text-h6">删除</span>
          文章 <span class="text-primary text-h6">{{ deleteArticle?.title }}</span> 吗？
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="white" @click="onDeleteCancel">取消</v-btn>
        <v-btn color="primary" @click="handleDelete">确定</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog
      v-model="loadingDialog.visible"
      :scrim="false"
      persistent
      width="auto">
    <v-card color="primary">
      <v-card-text>
        {{ loadingDialog.text }}
        <v-progress-linear
            :indeterminate="loadingDialog.loading"
            :color="loadingDialog.color" />
      </v-card-text>
    </v-card>
  </v-dialog>
  <v-dialog
      v-model="dialog"
      fullscreen
      scrollable
      transition="dialog-bottom-transition">
    <v-card color="background" class="rounded-t-0 rounded-b-0">
      <v-toolbar
          density="comfortable"
          color="primary">
        <v-btn color="surface" variant="plain" icon="mdi-close" @click="resetUpload"></v-btn>
        <v-toolbar-title v-if="editId">编辑 - {{ articleDetail?.title }}</v-toolbar-title>
        <v-toolbar-title v-else>创建 - {{ aFile[0]?.name }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn color="surface" variant="plain" icon="mdi-content-save-check" @click="handleUploadSubmit"/>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text>
        <v-card class="w-100 mx-auto mt-2 bg-transparent" max-width="800">
          <v-tabs v-model="tab" align-tabs="center" grow>
            <v-tab value="edit">编辑</v-tab>
            <v-tab value="preview">预览</v-tab>
          </v-tabs>
          <v-card-text class="overflow-auto">
            <v-window v-model="tab">
              <v-window-item value="edit">
                <v-form ref="uploadForm" validate-on="input lazy" @submit.prevent>
                  <v-text-field
                      v-model="title"
                      maxlength="20"
                      counter
                      :rules="titleRules"
                      :loading="titleExistLoading"
                      label="标题"
                      clearable
                      :autofocus="!editId"/>
                  <v-text-field
                      v-model="subtitle"
                      maxlength="40"
                      counter
                      :rules="[v => (!v || v.length <= 40) || '副标题不可超过40字']"
                      label="副标题"
                      clearable />
                  <v-combobox
                      v-model="tagIds"
                      v-model:search="tagSearch"
                      :hide-no-data="false"
                      :return-object="false"
                      auto-select-first
                      :items="allTags"
                      item-title="name"
                      item-value="id"
                      :rules="tagRules"
                      label="标签"
                      multiple>
                    <template v-slot:no-data>
                      <v-list-item>
                        <v-list-item-title>
                          无匹配标签 "<strong>{{ tagSearch }}</strong>"
                        </v-list-item-title>
                      </v-list-item>
                    </template>
                  </v-combobox>
                  <v-file-input
                      v-model="thumbnail"
                      accept="image/*"
                      show-size
                      clearable
                      label="封面"
                      prepend-icon=""
                      append-icon="mdi-image"
                      v-on:change="handleUploadThumbnail"/>
                  <v-btn block color="error" @click="resetUploadForm">重置</v-btn>
                  <v-img
                      class="mx-auto mt-4 rounded-lg"
                      v-if="thumbnailUrl"
                      :src="thumbnailUrl"
                      max-height="400"
                      cover />
                </v-form>
              </v-window-item>
              <v-window-item value="preview">
                <v-file-input
                    v-if="editId"
                    v-model="aFile"
                    :loading="fileExistLoading"
                    accept="text/html"
                    show-size
                    clearable
                    :label="'源文件 - ' + articleDetail.filename"
                    prepend-icon="mdi-file"
                    v-on:change="handleReUpload"/>
                <div v-if="html" class="markdown-body" v-html="html" />
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-expansion-panels v-if="articles" v-model="panels" class="mb-4">
    <v-expansion-panel v-for="article in articles.records" :key="article.id">
      <v-expansion-panel-title>
        <template v-slot:actions="{ expanded }">
          <v-icon :icon="expanded ? 'mdi-close' : 'mdi-magnify'"></v-icon>
        </template>
        <template v-slot:default="{ expanded }">
          <v-row class="align-center text-no-wrap pr-6">
            <v-col sm="5" class="d-flex text-primary">
              <h3>{{ article.title }}</h3>
            </v-col>
            <v-col sm="5" class="d-flex align-center">
              <v-icon class="mr-1" size="x-small">mdi-clock-outline</v-icon>
              {{ new Date(article.time).toLocaleString() }}
            </v-col>
            <v-col sm="2" class="d-flex align-center text-primary">
              <v-icon class="mr-2" size="x-small">mdi-cursor-default-click</v-icon>{{ article.clicked }}
            </v-col>
          </v-row>
        </template>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-container class="info pa-0 ma-2">
          <v-row>
            <v-col cols="12" sm="6">
              <h4>副标题</h4><span>：</span>
              <span v-if="article.subtitle">{{ article.subtitle }}</span>
              <v-icon v-else size="small">mdi-circle-outline</v-icon>
            </v-col>
            <v-col cols="12" sm="6">
              <h4>上次编辑</h4><span>：</span>
              <v-icon v-if="article.edited === null" size="small">mdi-circle-outline</v-icon>
              <span v-else>{{ new Date(article.edited).toLocaleString() }}</span>
            </v-col>
            <v-col cols="12" sm="6" class="d-flex align-center">
              <h4>标签</h4><span>：</span>
              <v-icon v-if="article.tags.length === 0" size="small">mdi-circle-outline</v-icon>
              <v-slide-group show-arrows>
                <v-slide-group-item
                    v-for="(tag, index) in article.tags"
                    :key="index">
                  <v-chip class="ma-1" variant="elevated" rounded>
                    {{ tag.name }}
                  </v-chip>
                </v-slide-group-item>
              </v-slide-group>
            </v-col>
            <v-col cols="12" sm="6" class="d-flex align-center">
              <h4>预览图</h4><span>：</span>
              <v-icon
                  v-if="article.thumbnail"
                  color="success"
                  size="small"
                  @click="api({ images: [article.thumbnail] })">
                mdi-circle
              </v-icon>
              <v-icon v-else size="small">mdi-circle-outline</v-icon>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" class="d-flex justify-start align-center">
              <v-btn
                  :disabled="getTKeyLoading"
                  :loading="getArticleLoading"
                  size="large"
                  density="comfortable"
                  @click="handleEdit(article.id)">
                <v-icon size="large">mdi-pencil-outline</v-icon>
              </v-btn>
              <v-btn
                  class="ml-4"
                  :disabled="getArticleLoading"
                  :loading="getTKeyLoading"
                  color="error"
                  size="large"
                  density="comfortable"
                  @click="onDelete(article)">
                <v-icon size="large">mdi-trash-can-outline</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-expansion-panel-text>
    </v-expansion-panel>
    <!--<v-overlay-->
    <!--    :model-value="getArticlesLoading"-->
    <!--    contained-->
    <!--    class="rounded align-center justify-center">-->
    <!--  <v-progress-circular-->
    <!--      indeterminate-->
    <!--      color="primary" />-->
    <!--</v-overlay>-->
  </v-expansion-panels>
  <!--<v-card v-else text="加载中..." />-->

  <div class="text-center">
    <v-pagination
        v-model="current"
        :disabled="getArticlesLoading"
        :length="totalPage"
        :total-visible="6" />
    <v-progress-linear
        v-if="getArticlesLoading"
        class="w-100"
        indeterminate
        color="white" />
  </div>
</div>
</template>

<style scoped>
.info h4 {
  display: inline-block;
  width: 4rem;
  margin-right: .3rem;
  color: #FED504;
  text-align: justify;
  text-align-last: justify;
  text-justify: inter-word;
}
.info h4 + span {
  margin-right: .5rem;
}
</style>