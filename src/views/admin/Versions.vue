<script setup>
import req from "@/utils/RequestUtil";
import {useLoadMore, useRequest} from "vue-request";
import store from "@/store";
import {ref} from "vue";
import { formatOnlyDate } from "@/utils/DateUtil";

const size = 5;
const getVersionsService = async (data) => {
  const _page = data?.page ? data.page + 1 : 1;
  const result = await req.sys.get('/general/versions', { page: _page, size: size });
  return {
    list: result.data.data.records,
    page: _page,
    total: result.data.data.pages,
  }
}
const editVersionService = async (v) => {
  const result = await req.sys.patch('/general/versions', v);
  return result.data.data;
}
const deleteVersionService = async id => {
  const result = await req.sys.delete('/general/versions/' + id);
  return result.data.data;
}
const uploadVersionService = async v => {
  const result = await req.sys.post('/general/versions', v);
  return result.data.data;
}

// 获取所有版本
const {
  refreshAsync,
  dataList: versions,
  loadingMore: vLoadingMore,
  noMore: vNoMore,
  loadMore: vLoadMore
} = useLoadMore(getVersionsService, {
  manual: false,
  isNoMore: (d) => { return d?.page === d?.total },
  onSuccess: () => {
    deleteVersion.value.id = versions.value[0]?.id;
    const lastVer = versions.value[0]?.version;
    if (lastVer) genNewVersions(lastVer)
    else genNewVersions('0.0.0');
  }
});

// 上传版本
const {
  data: vUploaded,
  runAsync: uploadRun,
  loading: uploadLoading
} = useRequest(uploadVersionService, {
  defaultParams: [{}],
});

// 编辑版本
const {
  data: jUpdated,
  runAsync: editRun
} = useRequest(editVersionService, { defaultParams: [{}] });

// 删除版本
const {
  data: vDeleted,
  runAsync: deleteRun
} = useRequest(deleteVersionService, {
  defaultParams: [0],
});

const colors = ['green', 'blue', 'yellow', 'orange', 'red'];
const addForm = ref();
const level = ref(-1);
const levelMenu = ref(false);
const newVer = ref('');
const newVerDetail = ref();
const newVersions = ref([]);
const loadingDialog = ref({
  visible: false,
  loading: true,
  text: '',
  color: 'white'
});
const textRules = [
  v => !!v || '版本描述不可为空',
  v => (v && v.length <= 100) || '版本描述不可超过100字',
];

const genNewVersions = cur => {
  newVersions.value = [];
  const parts = cur.split('.');
  const major = parseInt(parts[0]);
  const minor = parseInt(parts[1]);
  const patch = parseInt(parts[2]);

  // 生成下一个主版本号、次版本号和修订版本号的组合
  const nextPatchVersion = `${major}.${minor}.${patch + 1}`;
  const nextMinorVersion = `${major}.${minor + 1}.0`;
  const nextMajorVersion = `${major + 1}.0.0`;

  // 将生成的版本号添加到可选版本号列表
  newVersions.value.push(nextPatchVersion);
  newVersions.value.push(nextMinorVersion);
  newVersions.value.push(nextMajorVersion);
}

const handleAdd = async () => {
  loadingDialog.value.visible = true;
  loadingDialog.value.text = '正在进行验证...';
  if (level.value < 0) {
    loadingDialog.value.text = '未选择版本等级';
    loadingDialog.value.loading = false;
    setTimeout(() => {
      loadingDialog.value.visible = false;
      levelMenu.value = true;
    }, 1000);
    return;
  }
  const { valid } = await addForm.value.validate();
  if (valid) {
    loadingDialog.value.text = '正在添加版本...';
    const data = {
      level: level.value,
      version: newVer.value,
      detail: newVerDetail.value
    }
    await uploadRun(data);
    await store.dispatch('snackbar/openSnackbar', {
      msg: vUploaded.value ? '版本添加成功': '版本添加失败',
      type: vUploaded.value ? 'success': 'error'
    });
    newVerDetail.value = null;
    level.value = -1;
    await refreshAsync();
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
const versionInput = ref();
const onEdit = (version, toggle) => {
  versionInput.value = version.detail;
  toggle();
}
const handleEdit = async (id, toggle) => {
  loadingDialog.value.visible = true;
  loadingDialog.value.text = '正在进行验证...';
  const { valid } = await editForm.value[0].validate();
  if (valid) {
    loadingDialog.value.text = '正在更新版本...';
    const data = { id: id, detail: versionInput.value.trim() }
    await editRun(data);
    await store.dispatch('snackbar/openSnackbar', {
      msg: jUpdated.value ? '版本更新成功': '版本更新失败',
      type: jUpdated.value ? 'success': 'error'
    });
    await refreshAsync();
    loadingDialog.value.visible = false;
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
  versionInput.value = null;
  toggle();
}

const deleteDialog = ref(false);
const deleteVersion = ref({});
const onDelete = async v => {
  deleteVersion.value.id = v.id;
  deleteVersion.value.version = v.version;
  deleteDialog.value = true;
}

const onDeleteCancel = () => {
  deleteDialog.value = false;
  setTimeout(() => {
    delete deleteVersion.value.version;
  }, 500)
}

const handleDelete = async () => {
  deleteDialog.value = false;
  loadingDialog.value.visible = true;
  loadingDialog.value.text = '正在删除版本...'
  await deleteRun(deleteVersion.value.id);
  await store.dispatch('snackbar/openSnackbar', {
    msg: vDeleted.value ? '版本删除成功': '版本删除失败',
    type: vDeleted.value ? 'success': 'error'
  });
  deleteVersion.value = {};
  await refreshAsync();
  loadingDialog.value.visible = false;
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
            版本 <span class="text-primary text-h6">{{ deleteVersion?.version }}</span> 吗？
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
      <v-card>
        <v-card-text>
          {{ loadingDialog.text }}
          <v-progress-linear
              :indeterminate="loadingDialog.loading"
              :color="loadingDialog.color" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-item-group class="mt-8">
      <v-timeline side="end" align="start" truncate-line="both">
        <v-timeline-item
            density="compact"
            :dot-color="level === -1 ? 'grey' : colors[level] "
            fill-dot>
          <template v-slot:icon>
            <v-menu v-model="levelMenu" location="bottom center" class="mr-10">
              <template v-slot:activator="{ props }">
                <v-icon v-bind="props">mdi-plus</v-icon>
              </template>
              <v-list v-model="level">
                <v-list-subheader class="mb-2">
                  <p><span class="text-green">绿色</span> 为 <span class="text-primary">小型</span> 更新</p>
                  <p><span class="text-red">红色</span> 为 <span class="text-primary">重要</span> 更新</p>
                </v-list-subheader>
                <v-list-item
                    v-for="(color, index) in colors"
                    :base-color="color"
                    @click="level = index">
                  <v-icon class="w-100">mdi-checkbox-marked-circle-auto-outline</v-icon>
                </v-list-item>
                <v-list-item @click="level = -1">
                  <v-icon class="w-100" color="grey">mdi-refresh</v-icon>
                </v-list-item>
              </v-list>
            </v-menu>

          </template>
          <v-form class="mt-n1" ref="addForm" validate-on="input lazy" fast-fail @submit.prevent>
            <v-radio-group
                v-model="newVer"
                :rules="[v => !!v || '未选择版本号']"
                inline>
              <v-radio
                  class=""
                  v-for="ver in newVersions"
                  :value="ver">
                <template v-slot:label>
                  <div class="mr-2 text-primary ls-1">{{ver}}</div>
                </template>
              </v-radio>
            </v-radio-group>
            <v-textarea
                v-model="newVerDetail"
                style="min-width: 270px"
                placeholder="版本描述"
                :rules="textRules"
                maxlength="100"
                counter
                rows="1"
                density="comfortable"
                @keyup.enter="handleAdd"
                auto-grow
                clearable>
              <template v-slot:append>
                <v-scroll-y-transition>
                  <v-icon
                      size="x-large"
                      color="primary"
                      @click="handleAdd">
                    mdi-checkbox-marked-circle-auto-outline
                  </v-icon>
                </v-scroll-y-transition>
              </template>
            </v-textarea>
          </v-form>
        </v-timeline-item>
        <v-timeline-item
            v-for="version in versions"
            :key="version.id"
            density="compact"
            :dot-color="colors[version.level]"
            size="x-small"
            fill-dot>
          <v-item v-slot="{ isSelected, toggle }">
            <v-card>
              <v-card-title>
                <v-container class="pa-0">
                  <v-row no-gutters align="baseline">
                    <v-col :cols="isSelected ? '12' : 'auto'">
                      <div class="text-primary" style="min-width: 100px">
                        {{ version.version }} 版本
                      </div>
                    </v-col>
                    <v-spacer></v-spacer>
                    <v-col v-if="!isSelected" cols="auto">
                      <v-btn
                          density="comfortable"
                          color="primary"
                          @click="onEdit(version, toggle)">
                        <v-icon>mdi-pencil-outline</v-icon>
                      </v-btn>
                      <v-btn
                          v-if="deleteVersion.id === version.id"
                          class="ml-4"
                          density="comfortable" color="error"
                          @click="onDelete(version)">
                        <v-icon>mdi-trash-can-outline</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-title>
              <v-card-text class="pt-1">
                <v-form v-if="isSelected" ref="editForm" validate-on="input lazy" fast-fail @submit.prevent>
                  <v-textarea
                      v-model="versionInput"
                      :rules="textRules"
                      maxlength="100"
                      counter
                      rows="1"
                      density="compact"
                      @keyup.enter.prevent="handleEdit(version.id, toggle)"
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
                            @click="handleEdit(version.id, toggle)">
                          mdi-bookmark-check
                        </v-icon>
                      </v-scroll-y-transition>
                    </template>
                  </v-textarea>
                </v-form>
                <div v-else>
                  <p class="mb-2">
                    <v-icon size="x-small">mdi-calendar-check-outline</v-icon>
                    <span class="ml-2">{{ formatOnlyDate(version.date) }}</span>
                  </p>
                  <p class="text-h6">{{ version.detail }}</p>
                </div>
              </v-card-text>
            </v-card>
          </v-item>
        </v-timeline-item>
        <v-timeline-item
            v-if="!vNoMore"
            density="compact"
            dot-color="white"
            icon="mdi-dots-vertical"
            size="x-small"
            fill-dot>
          <v-btn v-if="versions.length > 0" class="mt-n1" size="small" :loading="vLoadingMore" @click="vLoadMore">更早版本记录</v-btn>
          <p v-else>无版本记录</p>
        </v-timeline-item>
      </v-timeline>
    </v-item-group>
  </div>
</template>

<style scoped>

</style>