<script setup>
import req from "@/utils/handleReq";
import {usePagination, useRequest} from "vue-request";
import store from "@/store";
import {ref} from "vue";
import {formatDate} from "../../utils/DateUtil";

const size = 10;
const getJournalsService = async () => {
  const result = await req.sys.get('/sentences/page', { page: current.value, size: size });
  return result.data.data;
}
const editJournalService = async (v) => {
  const result = await req.sys.patch('/sentences', v);
  return result.data.data;
}
const deleteJournalService = async id => {
  const result = await req.sys.delete('/sentences/' + id);
  return result.data.data;
}
const uploadJournalService = async content => {
  const result = await req.sys.post('/sentences', { content: content });
  return result.data.data;
}

// 分页获取动态
const {
  data: journals,
  current,
  totalPage,
  total,
  loading: getJournalsLoading,
  changeCurrent
} = usePagination(getJournalsService, {
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
    sessionStorage.setItem('a_j_current', current.value.toString());
  }
});
current.value = JSON.parse(sessionStorage.getItem('a_j_current'));

// 上传动态
const {
  data: jUploaded,
  runAsync: uploadRun,
  loading: uploadLoading
} = useRequest(uploadJournalService, {
  defaultParams: [''],
});

// 编辑动态
const {
  data: jUpdated,
  runAsync: editRun
} = useRequest(editJournalService, { defaultParams: [{}] });

// 删除动态
const {
  data: jDeleted,
  runAsync: deleteRun
} = useRequest(deleteJournalService, {
  defaultParams: [0],
});

const addForm = ref();
const newJournal = ref();
const loadingDialog = ref({
  visible: false,
  loading: true,
  text: '',
  color: 'white'
});
const textRules = [
  v => !!v || '动态不可为空',
  v => (v && v.length <= 100) || '动态不可超过100字',
]

const handleAdd = async () => {
  loadingDialog.value.visible = true;
  loadingDialog.value.text = '正在进行验证...';
  const { valid } = await addForm.value.validate();
  if (valid) {
    loadingDialog.value.text = '正在添加动态...';
    await uploadRun(newJournal.value);
    await store.dispatch('snackbar/openSnackbar', {
      msg: jUploaded.value ? '动态添加成功': '动态添加失败',
      type: jUploaded.value ? 'success': 'error'
    });
    changeCurrent(current.value);
    newJournal.value = null;
    loadingDialog.value.visible = false;
  } else {
    loadingDialog.value.text = '验证失败';
    loadingDialog.value.loading = false;
    setTimeout(() => {
      loadingDialog.value.visible = false;
    }, 1000);
  }
}

const editForm = ref();
const journalInput = ref();
const onEdit = (journal, toggle) => {
  journalInput.value = journal.content;
  toggle();
}
const handleEdit = async (id, toggle) => {
  loadingDialog.value.visible = true;
  loadingDialog.value.text = '正在进行验证...';
  const { valid } = await editForm.value[0].validate();
  if (valid) {
    loadingDialog.value.text = '正在更新动态...';
    const data = { id: id, content: journalInput.value.trim() }
    await editRun(data);
    await store.dispatch('snackbar/openSnackbar', {
      msg: jUpdated.value ? '动态更新成功': '动态更新失败',
      type: jUpdated.value ? 'success': 'error'
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
  journalInput.value = null;
  toggle();
}

const deleteDialog = ref(false);
const deleteJournal = ref({});
const onDelete = async v => {
  deleteJournal.value.id = v.id;
  deleteJournal.value.content = v.content;
  deleteDialog.value = true;
}

const onDeleteCancel = () => {
  deleteDialog.value = false;
  setTimeout(() => {
    deleteJournal.value = {};
  }, 500)
}

const handleDelete = async () => {
  deleteDialog.value = false;
  loadingDialog.value.visible = true;
  loadingDialog.value.text = '正在删除动态...'
  await deleteRun(deleteJournal.value.id);
  await store.dispatch('snackbar/openSnackbar', {
    msg: jDeleted.value ? '动态删除成功': '动态删除失败',
    type: jDeleted.value ? 'success': 'error'
  });
  loadingDialog.value.visible = false;
  deleteJournal.value = {};
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
            动态 <span class="text-primary text-h6">{{ deleteJournal?.content.substring(0, 5) }}...</span> 吗？
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
          v-model="newJournal"
          :loading="uploadLoading"
          :rules="textRules"
          maxlength="20"
          counter
          density="comfortable"
          prepend-icon="mdi-comment"
          @keyup.enter="handleAdd"
          clearable>
        <template v-slot:append>
          <v-scroll-y-transition>
            <v-icon
                size="x-large"
                color="primary"
                @click="handleAdd">
              mdi-comment-check
            </v-icon>
          </v-scroll-y-transition>
        </template>
      </v-text-field>
    </v-form>
    <v-item-group>
      <v-container v-if="journals">
        <v-row>
          <v-col
              v-for="tag in journals.records"
              :key="tag.id"
              cols="12">
            <v-item v-slot="{ isSelected, toggle }">
              <v-card max-width="800" class="mx-auto pt-1">
                <v-card-title>
                  <v-container class="pa-0">
                    <v-row no-gutters align="baseline">
                      <v-col :cols="isSelected ? '12' : 'auto'">
                        <span class="text-primary">
                          <v-icon size="x-small">mdi-calendar-edit-outline</v-icon>
                          <span class="ml-2">{{ formatDate(tag.date) }}</span>
                        </span>
                      </v-col>
                      <v-spacer></v-spacer>
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
                <v-card-text class="pt-1">
                  <v-form v-if="isSelected" ref="editForm" validate-on="input lazy" fast-fail @submit.prevent>
                    <v-textarea
                        v-model="journalInput"
                        :rules="textRules"
                        maxlength="100"
                        counter
                        rows="1"
                        density="compact"
                        @keyup.enter="handleEdit(tag.id, toggle)"
                        auto-grow
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
                              class="mx-n1"
                              size="x-large"
                              color="primary"
                              @click="handleEdit(tag.id, toggle)">
                            mdi-bookmark-check
                          </v-icon>
                        </v-scroll-y-transition>
                      </template>
                    </v-textarea>
                  </v-form>
                  <p v-else>{{ tag.content }}</p>
                </v-card-text>
              </v-card>
            </v-item>
          </v-col>
        </v-row>
      </v-container>
    </v-item-group>

    <div class="mx-auto">
      <v-progress-linear
          v-show="getJournalsLoading"
          class="w-75 mt-2 mb-4"
          indeterminate
          color="white" />
      <v-fade-transition>
        <v-pagination
            v-model="current"
            :disabled="getJournalsLoading"
            :length="totalPage"
            :total-visible="6" />
      </v-fade-transition>
    </div>
  </div>

</template>

<style scoped>

</style>