<script setup>
import req from "@/utils/RequestUtil";
import { usePagination } from "vue-request";
import { inject, onBeforeUnmount, onMounted, ref, watch } from "vue";

const getPhotosService = async () => {
  const result = await req.sys.get('/photos', { page: current.value, size: 12 });
  return result.data.data;
}

const divRef = ref();
const columns = ref([]);
const columnCount = ref(3);

// 分页获取照片
const {
  data: photos,
  current,
  totalPage,
  loading,
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
    columns.value = [];
    window.scrollTo(0, 0);
    sessionStorage.setItem('p_cur', current.value.toString());
    rearrangeColumns();
  }
});
current.value = JSON.parse(sessionStorage.getItem('p_cur'));

const layoutLoading = inject('layoutLoading');
watch(loading, (value) => {
  layoutLoading.value = value;
});

const rearrangeColumns = () => {
  const screenWidth = divRef.value.clientWidth;
  if (screenWidth >= 1080) {
    columnCount.value = 5;
  } else if (screenWidth >= 860) {
    columnCount.value = 4;
  } else if (screenWidth >= 600) {
    columnCount.value = 3;
  } else if (screenWidth >= 400) {
    columnCount.value = 2;
  } else {
    columnCount.value = 1;
  }
  columns.value = new Array(columnCount.value).fill(null).map(() => ({
    images: [],
  }));
  photos.value?.records.forEach((image, index) => {
    const columnIndex = index % columnCount.value;
    columns.value[columnIndex].images.push(image);
  });
}

const resizeObserver = new ResizeObserver(() => {
  rearrangeColumns();
});

onMounted(() => {
  resizeObserver.observe(divRef.value);
  rearrangeColumns();
});

onBeforeUnmount(() => {
  resizeObserver.unobserve(divRef.value);
});

</script>

<template>
  <div ref="divRef">
    <v-item-group v-if="photos" :multiple="true">
      <div class="d-flex justify-space-between" v-viewer>
        <v-item v-for="column in columns" v-slot="{ isSelected, toggle }">
          <div style="flex: 1" >
            <v-item-group :multiple="true">
              <v-item v-for="photo in column.images" v-slot="{ isSelected, toggle }">
                <v-card class="mx-2 mb-4" min-width="200">
                  <v-img
                      cover
                      :src="photo.url"
                      class="align-end"
                      style="cursor: pointer"
                      max-height="350"
                      min-height="150">
                    <template v-slot:placeholder>
                      <v-row
                          class="fill-height ma-0"
                          align="center"
                          justify="center">
                        <v-progress-circular indeterminate color="primary" />
                      </v-row>
                    </template>
                    <v-card-title class="text-white" v-text="photo.title" />
                  </v-img>
                  <v-card-text class="mb-n4 mt-n1" style="font-size: large">
                    <p style="font-size: 14px">{{ photo.content ? photo.content : '-'}}</p>
                    <p class="text-grey mt-1 mb-n2" style="font-size: 11px">{{ photo.date }}</p>
                  </v-card-text>

                  <v-card-actions class="d-flex pl-0">
                    <v-spacer></v-spacer>
                    <!--<v-btn size="small" variant="text" icon="mdi-heart"></v-btn>-->
                    <!--<v-btn size="small" variant="text" icon="mdi-bookmark"></v-btn>-->
                    <v-btn size="small" variant="text" icon="mdi-comment-quote" @click="toggle"></v-btn>
                  </v-card-actions>

                  <v-expand-transition>
                    <div v-show="isSelected">
                      <v-divider></v-divider>

                      <v-card-text>
                        评论功能已经在我的计划日程表上啦~至于什么时候能上线嘛...(¬‿¬)
                      </v-card-text>
                    </div>
                  </v-expand-transition>
                </v-card>
              </v-item>
            </v-item-group>
          </div>
        </v-item>
      </div>
      <v-alert
          v-if="photos.records.length < 1"
          color="primary"
          icon="mdi-flask-empty-outline"
          density="compact">
        这里空空如也~去别的地方看看吧！
      </v-alert>
    </v-item-group>
    <v-alert
        v-if="!photos"
        class="w-auto mx-auto"
        max-width="400"
        color="primary"
        icon="mdi-hand-okay"
        density="compact">
      已经在努力加载啦~<span class="ml-4">ᓚᘏᗢ</span>
    </v-alert>
    <div v-else class="text-center mb-4">
      <v-pagination
          v-model="current"
          size="small"
          :disabled="loading"
          :length="totalPage"
          :total-visible="6" />
    </div>
  </div>
</template>

<style scoped>

</style>