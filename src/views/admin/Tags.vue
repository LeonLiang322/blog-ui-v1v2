<script setup>
import req from "@/utils/handleReq";
import {usePagination, useRequest} from "vue-request";
import store from "@/store";
import {ref} from "vue";

const getTagsService = async () => {
  const result = await req.sys.get('/tags/page', { page: current.value, size: 4 });
  return result.data.data;
}
const editTagService = async (v) => {
  const result = await req.sys.patch('/tags', v);
  return result.data.data;
}

// 分页获取标签
const {
  data: tags,
  current,
  totalPage,
  loading: getTagsLoading,
  changeCurrent
} = usePagination(getTagsService, {
  pagination: {
    currentKey: 'current',
    totalPageKey: 'pages'
  },
  onSuccess: () => {
    window.scrollTo(0, 0);
    sessionStorage.setItem('a_t_current', current.value.toString());
  }
});
current.value = JSON.parse(sessionStorage.getItem('a_t_current'));

// 编辑标签
const {
  data: tUpdated,
  runAsync: editRun,
  loading: editLoading
} = useRequest(editTagService, { defaultParams: [{}] });

const nameRules = [
  v => !!v || '标签不可为空',
  v => console.log(v) || (v && v.length <= 20) || '标签不可超过20字',
]

const tagInput = ref();
const onEdit = (name, toggle) => {
  tagInput.value = name;
  toggle();
}
const handleEdit = async (id, name, toggle) => {
  const data = { id: id, name: name }
  console.log(data)
  await editRun(data);
  await store.dispatch('snackbar/openSnackbar', {
    msg: tUpdated.value ? '标签更新成功': '标签更新失败',
    type: tUpdated.value ? 'success': 'error'
  });
  toggle();
}

</script>

<template>
  <div>
    <v-item-group>
      <v-container v-if="tags">
        <v-row>
          <v-col
              v-for="tag in tags.records"
              :key="tag.id"
              cols="12"
              sm="6">
            <v-item v-slot="{ isSelected, toggle }">
              <v-card class="pt-2" style="transition: all .5s ease-in-out;">
                <v-card-title>
                  <v-container class="pa-0">
                    <v-row no-gutters align="baseline">
                      <v-col :cols="isSelected ? '12' : 'auto'">
                        <v-text-field
                            v-if="isSelected"
                            v-model="tag.name"
                            maxlength="20"
                            counter
                            density="comfortable"
                            @keyup.enter="handleEdit(tag.id, tag.name, toggle)"
                            autofocus
                            clearable />
                        <span v-else class="text-primary">{{ tag.name }}</span>
                      </v-col>
                      <v-spacer></v-spacer>
                      <v-col cols="auto">
                        <v-btn
                            v-if="isSelected"
                            class="mr-4"
                            :loading="editLoading"
                            density="comfortable"
                            color="success"
                            @click="handleEdit(tag.id, tag.name, toggle)">
                          <v-icon>mdi-check</v-icon>
                        </v-btn>
                        <v-btn
                            v-else
                            class="mr-4"
                            density="comfortable"
                            color="primary"
                            @click="onEdit(tag.name, toggle)">
                          <v-icon>mdi-pencil-outline</v-icon>
                        </v-btn>
                        <v-btn density="comfortable" color="error" @click="">
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

    <div class="text-center">
      <v-progress-linear
          v-show="getTagsLoading"
          class="w-75 mb-2"
          indeterminate
          color="white" />
      <v-pagination
          style="transition: .5s ease-in-out"
          v-model="current"
          :disabled="getTagsLoading"
          :length="totalPage"
          :total-visible="6" />
    </div>
  </div>

</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>