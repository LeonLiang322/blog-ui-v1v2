<script setup>
import {onMounted, ref} from "vue";
import {usePagination, useRequest} from "vue-request";
import req from "@/utils/RequestUtil";
import store from "@/store";
import {api} from "v-viewer";

const size = 12;
// ---------------------------------- Services & APIs ----------------------------------
const checkFileService = async (v) => {
  const result = await req.sys.get('/photos/check-filename', { filename: v });
  return result.data.data;
}
const uploadImgService = async (v) => {
  const result = await req.pic.post('/upload', v);
  return result.data.data;
}
const deleteImgService = async (v) => {
  const result = await req.pic.delete('/images/' + v);
  return result.data.data;
}
const uploadPhotoService = async (v) => {
  const result = await req.sys.post('/photos', v);
  return result.data.data;
}
const getPhotosService = async () => {
  const result = await req.sys.get('/photos', { page: current.value, size: size });
  return result.data.data;
}
const getPhotoService = async (id) => {
  const result = await req.sys.get('/photos/' + id);
  return result.data.data;
}
const getPKeyService = async id => {
  const result = await req.sys.get('/photos/pKey/' + id);
  return result.data.data;
}
const deletePhotoService = id => {
  return req.sys.delete('/photos/' + id);
}
const editPhotoService = async (v) => {
  const result = await req.sys.patch('/photos', v);
  return result.data.data;
}

// 分页获取照片
const {
  data: photos,
  current,
  totalPage,
  loading: getPhotosLoading,
  changeCurrent
} = usePagination(getPhotosService, {
  pagination: {
    currentKey: 'current',
    totalPageKey: 'pages'
  },
  onSuccess: () => {
    if (current.value > totalPage.value) {
      current.value--;
      changeCurrent(current.value);
      return;
    }
    window.scrollTo(0, 0);
    sessionStorage.setItem('a_p_current', current.value.toString());
  }
});
current.value = JSON.parse(sessionStorage.getItem('a_p_current'));

// 检查照片文件是否已上传
const {
  data: fileExist,
  loading: fileExistLoading,
  runAsync: fileExistRun
} = useRequest(checkFileService, {
  defaultParams: [''],
});

// 上传照片至图床
const {
  data: imgUploaded,
  runAsync: uploadImgRun
} = useRequest(uploadImgService, {
  defaultParams: [new FormData()],
});

// 删除图床照片
const {
  data: imgDeleted,
  runAsync: deleteImgRun
} = useRequest(deleteImgService, {
  defaultParams: [0],
});

// 上传照片
const {
  data: pUploaded,
  runAsync: uploadPhotoRun
} = useRequest(uploadPhotoService, {
  defaultParams: [{}],
});

// 根据ID获取照片信息
const {
  data: photoDetail,
  runAsync: getPhotoRun,
  loading: getPhotoLoading,
} = useRequest(getPhotoService, {
  defaultParams: [null],
  loadingKeep: 1000,
});

// 编辑照片信息
const {
  data: pUpdated,
  runAsync: editRun,
} = useRequest(editPhotoService, {
  defaultParams: [{}],
});

// 删除照片信息
const {
  data: pDeleted,
  runAsync: deleteRun,
} = useRequest(deletePhotoService, {
  defaultParams: [0],
});

// 获取照片PKey
const {
  data: pkey,
  runAsync: getPKeyRun,
  loading: getPKeyLoading
} = useRequest(getPKeyService, {
  defaultParams: [0],
});

// ---------------------------------- 通用变量 ----------------------------------
const pFile = ref([]);
const dialog = ref(false);
const loadingDialog = ref({
  visible: false,
  loading: true,
  text: '',
  color: 'white'
});
const uploadForm = ref();
const title = ref('');
const content = ref('');
const photoUrl = ref('');
const titleRules = [
  v => !!v || '标题不可为空',
  v => (v && v.length <= 20) || '标题不可超过20字',
];
// 重置或取消上传
const resetUpload = () => {
  dialog.value = false;
  uploadForm.value.reset();
  pFile.value = [];
  photoUrl.value = null;
  editId.value = null;
}
// 使用上传文件框时
const handleUpload = async () => {
  await fileExistRun(pFile.value[0].name);
  if (fileExist.value) {
    pFile.value = null;
    await store.dispatch('snackbar/openSnackbar', {
      msg: '该照片已上传',
      type: 'warning'
    });
  } else {
    photoUrl.value = URL.createObjectURL(pFile.value[0])
    dialog.value = true;
  }
}

const handleUploadSubmit = async () => {
  loadingDialog.value.visible = true;
  loadingDialog.value.text = '正在进行表单验证...';
  const { valid } = await uploadForm.value.validate();
  if (valid) {
    // 初始化表单数据
    const data = {
      title: title.value,
      content: content.value ? content.value : '',
    }
    // 如果当前为更新操作
    if (editId.value) {
      data.id = editId.value;
      loadingDialog.value.text = '正在更新照片信息...'
      await editRun(data);
      await store.dispatch('snackbar/openSnackbar', {
        msg: pUpdated.value ? '照片信息更新成功': '照片信息更新失败',
        type: pUpdated.value ? 'success': 'error'
      });
    } else {
      data.filename = pFile.value[0].name
      // 如果当前为上传新照片操作
      loadingDialog.value.text = '正在上传至图床...'
      const formData = new FormData();
      formData.append('file', pFile.value[0]);
      await uploadImgRun(formData);
      data.url = imgUploaded.value.links.url;
      data.pkey = imgUploaded.value.key;
      loadingDialog.value.text = '正在上传照片...'
      await uploadPhotoRun(data);
      await store.dispatch('snackbar/openSnackbar', {
        msg: pUploaded.value ? '照片上传成功': '照片上传失败',
        type: pUploaded.value ? 'success': 'error'
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

// ---------------------------------- 照片更新 ----------------------------------
const editId = ref(null);
const tkey = ref();

const handleEdit = async id => {
  await getPhotoRun(id);
  const v = photoDetail.value;
  title.value = v.title;
  content.value = v.content;
  tkey.value = v.tkey;
  photoUrl.value = v.url;
  editId.value = id;
  dialog.value = true;
}

// ---------------------------------- 照片删除 ----------------------------------
const deleteDialog = ref(false);
const deletePhoto = ref({});
const onDelete = async v => {
  await getPKeyRun(v.id);
  deletePhoto.value.id = v.id;
  deletePhoto.value.title = v.title;
  deletePhoto.value.pkey = pkey.value;
  deleteDialog.value = true;
}

const onDeleteCancel = () => {
  deleteDialog.value = false;
  setTimeout(() => {
    deletePhoto.value = {};
  }, 500)
}

const handleDelete = async () => {
  deleteDialog.value = false;
  loadingDialog.value.visible = true;
  loadingDialog.value.text = '正在删除照片...'
  await deleteRun(deletePhoto.value.id);
  if (pDeleted) {
    loadingDialog.value.text = '正在删除图床图片...'
    await deleteImgRun(deletePhoto.value.pkey);
  }
  await store.dispatch('snackbar/openSnackbar', {
    msg: pDeleted.value ? '照片删除成功': '照片删除失败',
    type: pDeleted.value ? 'success': 'error'
  });
  if (!imgDeleted) {
    setTimeout(() => {
      store.dispatch('snackbar/openSnackbar', {
        msg: '图床图片删除失败',
        type: 'error'
      });
    }, 1000)
  }
  loadingDialog.value.visible = false;
  deletePhoto.value = {};
  if (photos.value.records.length <= 1) current.value--;
  changeCurrent(current.value);
}
</script>

<template>
  <div>
    <v-file-input
        v-model="pFile"
        :loading="fileExistLoading"
        accept="image/*"
        show-size
        clearable
        label="上传照片文件"
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
            照片 <span class="text-primary text-h6">{{ deletePhoto?.title }}</span> 吗？
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
          <v-toolbar-title v-if="editId">编辑 - {{ photoDetail?.title }}</v-toolbar-title>
          <v-toolbar-title v-else>创建 - {{ pFile[0]?.name }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn color="surface" variant="plain" icon="mdi-content-save-check" @click="handleUploadSubmit"/>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-card class="w-100 mx-auto mt-2 bg-transparent" max-width="800">
            <v-card-text class="overflow-auto">
              <v-form ref="uploadForm" validate-on="input lazy" fast-fail @submit.prevent>
                <v-text-field
                    v-model="title"
                    maxlength="40"
                    counter
                    :rules="titleRules"
                    label="标题"
                    clearable />
                <v-textarea
                    v-model="content"
                    maxlength="100"
                    counter
                    :rules="[v => (!v || v.length <= 100) || '配文不可超过100字']"
                    label="配文"
                    clearable
                    auto-grow/>
                <v-btn block color="error" @click="uploadForm.reset()">重置</v-btn>
                <v-img
                    class="mx-auto mt-4 rounded-lg"
                    :src="photoUrl"
                    cover />
              </v-form>

            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-container v-if="photos">
      <v-row>
        <v-col
            v-for="photo in photos.records"
            :key="photo.id"
            cols="12"
            sm="4">
          <v-hover v-slot="{ isHovering, props }">
            <v-card class="overflow-x-auto" v-bind="props">
              <div class="h-100 d-flex flex-no-wrap justify-space-between">
                <div class="w-100">
                  <v-img
                      height="130"
                      :src="photo.url"
                      aspect-ratio="1"
                      cover>
                    <template v-slot:placeholder>
                      <v-row
                          class="fill-height ma-0"
                          align="center"
                          justify="center">
                        <v-progress-circular indeterminate color="primary" />
                      </v-row>
                    </template>
                  </v-img>
                  <v-card-title class="text-h6 text-primary">
                    {{photo.title}}
                  </v-card-title>
                  <v-card-text>
                    <p v-if="photo.content">{{ photo.content }}</p>
                    <v-icon v-else size="small">mdi-circle-outline</v-icon>
                  </v-card-text>
                  <v-overlay
                      class="align-center justify-center"
                      :model-value="isHovering"
                      contained>
                    <v-container>
                      <v-row class="text-center" justify="center">
                        <v-col cols="12" sm="4">
                          <v-btn
                              color="blue"
                              size="large"
                              @click="api({ images: [photo.url] })">
                            <v-icon size="large">mdi-magnify</v-icon>
                          </v-btn>
                        </v-col>
                        <v-col cols="12" sm="4">
                          <v-btn
                              :disabled="getPKeyLoading"
                              :loading="getPhotoLoading"
                              size="large"
                              @click="handleEdit(photo.id)">
                            <v-icon size="large">mdi-pencil-outline</v-icon>
                          </v-btn>
                        </v-col>
                        <v-col cols="12" sm="4">
                          <v-btn
                              :disabled="getPhotoLoading"
                              :loading="getPKeyLoading"
                              color="error"
                              size="large"
                              @click="onDelete(photo)">
                            <v-icon size="large">mdi-trash-can-outline</v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-container>



                  </v-overlay>

                </div>
              </div>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-container>

    <div class="mx-auto">
      <v-progress-linear
          v-show="getPhotosLoading"
          class="w-75 mt-2 mb-4"
          indeterminate
          color="white" />
      <v-fade-transition>
        <v-pagination
            v-model="current"
            :disabled="getPhotosLoading"
            :length="totalPage"
            :total-visible="6" />
      </v-fade-transition>
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