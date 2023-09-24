<script setup>
import req from "@/utils/handleReq";
import {usePagination, useRequest} from "vue-request";
import store from "@/store";
import {ref} from "vue";
import {JSEncrypt} from "jsencrypt";

const size = 10;
const getTagsService = async () => {
  const result = await req.sys.get('/tags/page', { page: current.value, size: size });
  return result.data.data;
}
const editTagService = async (v) => {
  const result = await req.sys.patch('/tags', v);
  return result.data.data;
}
const checkTagService = async v => {
  const result = await req.sys.get('/tags/check', { name: v });
  return result.data.data;
}
const deleteTagService = async id => {
  const result = await req.sys.delete('/tags/' + id);
  return result.data.data;
}
const uploadTagService = async name => {
  const result = await req.sys.post('/tags', { name: name });
  return result.data.data;
}

// 分页获取标签
const {
  data: tags,
  current,
  totalPage,
  total,
  loading: getTagsLoading,
  changeCurrent
} = usePagination(getTagsService, {
  pagination: {
    currentKey: 'current',
    totalPageKey: 'pages',
    totalKey: 'total'
  },
  onSuccess: () => {
    if (current.value > totalPage.value) {
      current.value--;
      changeCurrent(current.value);
      return;
    }
    window.scrollTo(0, 0);
    sessionStorage.setItem('a_t_current', current.value.toString());
  }
});
current.value = JSON.parse(sessionStorage.getItem('a_t_current'));

// 防抖检查标签是否存在
const {
  data: tagExist,
  loading: tagExistLoading,
  runAsync: tagExistRun
} = useRequest(checkTagService, {
  defaultParams: [''],
  debounceInterval: 1000,
});

// 上传标签
const {
  data: tUploaded,
  runAsync: uploadRun,
  loading: uploadLoading
} = useRequest(uploadTagService, {
  defaultParams: [''],
});

// 编辑标签
const {
  data: tUpdated,
  runAsync: editRun
} = useRequest(editTagService, { defaultParams: [{}] });

// 删除标签
const {
  data: tDeleted,
  runAsync: deleteRun
} = useRequest(deleteTagService, {
  defaultParams: [0],
});

const addForm = ref();
const newTag = ref();
const loadingDialog = ref({
  visible: false,
  loading: true,
  text: '',
  color: 'white'
});
const nameRules = [
  v => !!v || '标签不可为空',
  v => (v && v.length <= 20) || '标签不可超过20字',
  v => handleTagInput(v),
]
// 标题输入时执行检查
const handleTagInput = async (value) => {
  if (originName && value === originName) return true;
  await tagExistRun(value);
  return tagExist.value ? '标签已存在' : true;
}

const handleAdd = async () => {
  loadingDialog.value.visible = true;
  loadingDialog.value.text = '正在进行验证...';
  const { valid } = await addForm.value.validate();
  if (valid) {
    loadingDialog.value.text = '正在添加标签...';
    await uploadRun(newTag.value);
    await store.dispatch('snackbar/openSnackbar', {
      msg: tUploaded.value ? '标签添加成功': '标签添加失败',
      type: tUploaded.value ? 'success': 'error'
    });
    newTag.value = null;
    loadingDialog.value.visible = false;
    changeCurrent(current.value);
  } else {
    loadingDialog.value.text = '表单验证失败';
    loadingDialog.value.loading = false;
    setTimeout(() => {
      loadingDialog.value.visible = false;
    }, 1000);
  }
}

let originName = null;
const editForm = ref();
const tagInput = ref();
const onEdit = (tag, toggle) => {
  tagInput.value = tag.name;
  originName = tag.name;
  toggle();
}
const handleEdit = async (id, toggle) => {
  if (tagInput.value === originName) {
    toggle();
    return;
  }
  loadingDialog.value.visible = true;
  loadingDialog.value.text = '正在进行验证...';
  const { valid } = await editForm.value[0].validate();
  if (valid) {
    loadingDialog.value.text = '正在更新标签...';
    const data = { id: id, name: tagInput.value }
    await editRun(data);
    await store.dispatch('snackbar/openSnackbar', {
      msg: tUpdated.value ? '标签更新成功': '标签更新失败',
      type: tUpdated.value ? 'success': 'error'
    });
    loadingDialog.value.visible = false;
    changeCurrent(current.value);
  } else {
    loadingDialog.value.text = '验证失败';
    loadingDialog.value.loading = false;
    setTimeout(() => {
      loadingDialog.value.visible = false;
    }, 1000);
  }
  toggle();
}

const onEditCancel = toggle => {
  tagInput.value = null;
  originName = null;
  toggle();
}

const deleteDialog = ref(false);
const deleteTag = ref({});
const onDelete = async v => {
  deleteTag.value.id = v.id;
  deleteTag.value.name = v.name;
  deleteDialog.value = true;
}

const onDeleteCancel = () => {
  deleteDialog.value = false;
  setTimeout(() => {
    deleteTag.value = {};
  }, 500)
}

const handleDelete = async () => {
  deleteDialog.value = false;
  loadingDialog.value.visible = true;
  loadingDialog.value.text = '正在删除标签...'
  await deleteRun(deleteTag.value.id);
  await store.dispatch('snackbar/openSnackbar', {
    msg: tDeleted.value ? '标签删除成功': '标签删除失败',
    type: tDeleted.value ? 'success': 'error'
  });
  loadingDialog.value.visible = false;
  deleteTag.value = {};
  changeCurrent(current.value);
}
</script>

<template>
  <div>
    <v-dialog
        v-model="deleteDialog"
        width="auto">
      <v-card>
        <v-card-text class="text-center">
          <v-icon class="mb-2" color="warning" size="60">mdi-alert-box</v-icon>
          <p>
            确定要 <span class="text-warning text-h6">删除</span>
            标签 <span class="text-primary text-h6">{{ deleteTag?.name }}</span> 吗？
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
    <v-form class="mt-4" ref="addForm" validate-on="input lazy" fast-fail @submit.prevent>
      <v-text-field
          v-model="newTag"
          :loading="uploadLoading"
          :rules="nameRules"
          maxlength="20"
          counter
          density="comfortable"
          prepend-icon="mdi-tag"
          @keyup.enter="handleAdd"
          clearable>
        <template v-slot:append>
          <v-scroll-y-transition>
            <v-icon
                :disabled="tagExist"
                size="x-large"
                color="primary"
                @click="handleAdd">
              mdi-bookmark-check
            </v-icon>
          </v-scroll-y-transition>
        </template>
      </v-text-field>
    </v-form>
    <v-item-group>
      <v-container v-if="tags">
        <v-row>
          <v-col
              v-for="tag in tags.records"
              :key="tag.id"
              cols="12"
              sm="6">
            <v-item v-slot="{ isSelected, toggle }">
              <v-card class="pt-1">
                <v-card-title>
                  <v-container class="pa-0">
                    <v-row no-gutters align="baseline">
                      <v-col :cols="isSelected ? '12' : 'auto'">
                        <v-form v-if="isSelected" ref="editForm" validate-on="input lazy" fast-fail @submit.prevent>
                          <v-text-field
                              v-model="tagInput"
                              class="mt-1"
                              :loading="tagExistLoading"
                              :rules="nameRules"
                              maxlength="20"
                              counter
                              density="compact"
                              @keyup.enter="handleEdit(tag.id, toggle)"
                              autofocus
                              clearable>
                            <template v-slot:prepend>
                              <v-icon
                                  class="mx-n1"
                                  @click="onEditCancel(toggle)">
                                mdi-close
                              </v-icon>
                            </template>
                            <template v-slot:append>
                              <v-scroll-y-transition>
                                <v-icon
                                    v-if="originName !== tagInput"
                                    :disabled="tagExist"
                                    class="mx-n1"
                                    size="x-large"
                                    color="primary"
                                    @click="handleEdit(tag.id, toggle)">
                                  mdi-bookmark-check
                                </v-icon>
                              </v-scroll-y-transition>
                            </template>
                          </v-text-field>
                        </v-form>
                        <span v-else class="text-primary">{{ tag.name }}</span>
                      </v-col><v-spacer />
                      <v-col v-if="!isSelected" cols="auto">
                        <v-btn
                            class="mr-4"
                            density="comfortable"
                            color="primary"
                            @click="onEdit(tag, toggle)">
                          <v-icon>mdi-pencil-outline</v-icon>
                        </v-btn>
                        <v-btn density="comfortable" color="error" @click="onDelete(tag)">
                          <v-icon>mdi-trash-can-outline</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-title>
                <v-card-text>
                  <v-container class="pa-0">
                    <v-row no-gutters align="baseline">
                      <v-col cols="12" sm="6" class="mb-1">
                        <v-icon size="small">mdi-sigma</v-icon>
                        应用于<span class="mx-2 text-h6">{{ tag.count }}</span>篇文章
                      </v-col>
                      <v-col>
                        <v-icon size="small">mdi-calendar-check-outline</v-icon>
                        创建于<span class="ml-2">{{ new Date(tag.time).toLocaleString() }}</span>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
              </v-card>
            </v-item>
          </v-col>
        </v-row>
      </v-container>
    </v-item-group>

    <div class="mx-auto">
      <v-progress-linear
          v-show="getTagsLoading"
          class="w-75 mt-2 mb-4"
          indeterminate
          color="white" />
      <v-fade-transition>
        <v-pagination
            v-model="current"
            :disabled="getTagsLoading"
            :length="totalPage"
            :total-visible="6" />
      </v-fade-transition>
    </div>
  </div>
</template>

<style scoped>

</style>