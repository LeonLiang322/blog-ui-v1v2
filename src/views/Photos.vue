<script setup>
import req from "@/utils/handleReq";
import {useLoadMore, useRequest} from "vue-request";
import {inject, onBeforeUnmount, onMounted, ref, watch} from "vue";

// const getPhotoService = async () => {
//   const results = await req.sys.get('/photos', { page: page.value, size: 12 });
//   return results.data.data;
// }

// const page = ref(1);
// const total = ref(0);
// const images = ref([]);
const divRef = ref();
const columns = ref([]);
const columnCount = ref(3);
// const btnVis = ref(true);

const getPhotosService = async (data) => {
  const _page = data?.page ? data.page + 1 : 1;
  const result = await req.sys.get('/photos', {page: _page, size: 10});
  return {
    list: result.data.data.records,
    page: _page,
    total: result.data.data.pages,
  }
}

const {
  data,
  dataList: images,
  loading,
  loadingMore,
  noMore,
  loadMore
} = useLoadMore(getPhotosService, {
  manual: false,
  isNoMore: (d) => {
    return d?.page === d?.total;
  },
  onSuccess: () => {
    rearrangeColumns();
  }
});

// const {
//   data: photos,
//   loading,
//   run: getRun,
// } = useRequest(getPhotoService, {
//   cacheKey: 'photos',
//   cacheTime: 5 * 60 * 1000,
//   onSuccess: (resp) => {
//     images.value.push(...resp.records);
//     total.value = resp.pages;
//     rearrangeColumns();
//     if (page.value >= total.value) btnVis.value = false;
//   }
// });

const layoutLoading = inject('layoutLoading');
watch(loading, (value) => {
  layoutLoading.value = value;
});

// const loadMore = () => {
//   page.value++;
//   getRun();
// }
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

  images.value.forEach((image, index) => {
    const columnIndex = index % columnCount.value;
    columns.value[columnIndex].images.push(image);
  });
}
const resizeObserver = new ResizeObserver(() => {
  rearrangeColumns();
})
onMounted(() => {
  resizeObserver.observe(divRef.value);
  document.title = 'L1am的熬夜空间 | 照片'
});

onBeforeUnmount(() => {
  resizeObserver.unobserve(divRef.value);
});

</script>

<template>

  <div ref="divRef">
    <v-alert
        v-if="images.length === 0"
        color="primary"
        icon="mdi-flask-empty-outline"
        density="compact">
      这里空空如也~去别的地方看看吧！
    </v-alert>
    <v-item-group :multiple="true">
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
    </v-item-group>
    <v-sheet v-if="images.length > 0" class="d-flex justify-center align-center py-2 bg-transparent">
      <v-btn v-if="!noMore" @click="loadMore" :loading="loadingMore">更多</v-btn>
      <p v-else class="ls-1">已经到达这个世界的尽头啦~</p>
    </v-sheet>
  </div>


</template>

<style scoped>

</style>