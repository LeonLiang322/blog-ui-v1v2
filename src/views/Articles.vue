<script setup>
import req from "@/utils/handleReq";
import {useLoadMore, useRequest} from "vue-request";
import {inject, onMounted, ref, watch} from "vue";
import router from "@/router";
import bg from "@/assets/images/article-bg.jpg"

// const articles = ref([]);
// const page = ref(1);
// const total = ref(0);
// const btnVis = ref(true);

// const getArticlesService = async () => {
//   const results = await req.sys.get('/articles', { page: page.value, size: 2});
//   return results.data.data;
// }
const clickArticleService = async (id) => {
  return await req.sys.patch('/articles/click/' + id);
}
// // 获取所有文章
// const {
//   loading,
//   run: getRun,
// } = useRequest(getArticlesService, {
//   cacheKey: 'articles',
//   cacheTime: 5 * 60 * 1000, // 5分钟缓存时间
//   onSuccess: (resp) => {
//     articles.value.push(...resp.records);
//     total.value = resp.pages;
//     if (page.value >= total.value) btnVis.value = false;
//   }
// });

const getArticlesService = async (data) => {
  const _page = data?.page ? data.page + 1 : 1;
  const result = await req.sys.get('/articles', {page: _page, size: 5});
  return {
    list: result.data.data.records,
    page: _page,
    total: result.data.data.pages,
  }
}

const {
  data,
  dataList: articles,
  loading,
  loadingMore,
  noMore,
  loadMore
} = useLoadMore(getArticlesService, {
  manual: false,
  isNoMore: (d) => {
    return d?.page === d?.total;
  },
});

const layoutLoading = inject('layoutLoading');
watch(loading, (value) => {
  layoutLoading.value = value;
});

const { run: clickRun } = useRequest(clickArticleService, {
  defaultParams: [null],
});

const jump = async (id) => {
  loading.value = true;
  await clickRun(id);
  await router.push({path: '/article', query: {id: id}});
}

// const loadMore = () => {
//   page.value++;
//   getRun();
// }
// getRun();

onMounted(() => {
  document.title = "L1am的熬夜空间 | 文章"
});

</script>

<template>
  <div>
    <v-alert
        v-if="articles.length === 0"
        color="primary"
        icon="mdi-flask-empty-outline"
        density="compact">
      这里空空如也~去别的地方看看吧！
    </v-alert>
    <v-item-group v-else :multiple="true">
      <v-container>
        <v-row v-if="articles">
          <v-col
              class="d-flex justify-center"
              v-for="(article, index) in articles"
              :key="index"
              cols="12">
            <v-item v-slot="{ isSelected, toggle }">
              <v-card
                  class="card w-100 elevation-5"
                  max-width="800"
                  :ripple="false">
                <div class="position-relative d-inline-block w-100">
                  <v-img
                      :src="article.thumbnail ? article.thumbnail : bg"
                      max-height="200"
                      cover />
                  <div class="overlay d-flex flex-column position-absolute justify-center align-center pa-4 w-100 h-100">
                    <p class="text-center">{{ article.title }}</p>
                    <p class="subtitle mt-2 text-center">{{ article.subtitle }}</p>
                  </div>
                </div>
                <v-card-actions>
                  <div class="d-flex justify-space-between align-center w-100">
                    <div class="status d-flex align-center ml-2">
                      <v-icon class="mr-2" icon="mdi-eye-outline" size="small"></v-icon>
                      <span class="mr-3">{{ article.clicked }}</span>
                      <!--<v-icon class="mr-1" icon="mdi-heart-circle" size="small"></v-icon>-->
                    </div>
                    <v-btn
                        v-if="article.tags.length > 0"
                        class="px-6"
                        density="compact"
                        variant="plain"
                        @click="toggle"
                        :icon="isSelected ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                    <v-btn variant="text" @click="jump(article.id)">看看写的啥</v-btn>
                  </div>
                </v-card-actions>

                <v-expand-transition>
                  <div v-show="isSelected" class="w-100">
                    <v-divider />
                    <v-chip-group class="my-1 mx-4">
                      <v-chip
                          v-for="tag in article.tags"
                          class="rounded-lg mr-3 elevation-2 pa-2"
                          style="font-size: 14px"
                          variant="outlined"
                          size="small"
                          :ripple="false">
                        {{ tag.name }}
                      </v-chip>
                    </v-chip-group>
                  </div>
                </v-expand-transition>
              </v-card>
            </v-item>
          </v-col>
        </v-row>
      </v-container>
    </v-item-group>
    <v-sheet v-if="articles.length > 0" class="d-flex justify-center align-center py-2 bg-transparent">
      <v-btn v-if="!noMore" @click="loadMore" :loading="loadingMore">更多</v-btn>
      <p v-else class="ls-1">已经到达这个世界的尽头啦~</p>
    </v-sheet>
  </div>
</template>

<style scoped>
.card {
  transition: all 0.2s ease-in-out;
}
.card:hover {
  /*transform: perspective(800px) translateZ(5px);*/
  transform: translateY(-2px);
}
/*.img {*/
/*  overflow: hidden;*/
/*  transition: all 0.2s ease-in-out;*/
/*  transform: scale(1.1);*/
/*}*/
/*.text:nth-child(n) {*/
/*  border: 1px solid red;*/
/*}*/
.status {
  font-size: 13px;
}
.overlay {
  top: 0;
  left: 0;
  background-color: #26292f50;
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 5px;
  text-shadow: 0 0 5px black;
  color: #FED504;
  .subtitle {
    font-size: 18px;
    letter-spacing: 3px;
    color: white;
  }
}

</style>