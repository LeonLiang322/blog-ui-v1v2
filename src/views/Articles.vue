<script setup>
import req from "@/utils/RequestUtil";
import { usePagination, useRequest } from "vue-request";
import { inject, watch } from "vue";
import router from "@/router";
import bg from "@/assets/images/article-bg.jpg"
import {formatDate} from "@/utils/DateUtil";

const clickArticleService = async (id) => {
  return await req.sys.patch('/articles/click/' + id);
}

const getArticlesService = async () => {
  const result = await req.sys.get('/articles', { page: current.value, size: 10 });
  return result.data.data;
}

// 分页获取文章
const {
  data: articles,
  current,
  totalPage,
  loading,
  changeCurrent
} = usePagination(getArticlesService, {
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
    sessionStorage.setItem('a_cur', current.value.toString());
  }
});
current.value = JSON.parse(sessionStorage.getItem('a_cur'));

const layoutLoading = inject('layoutLoading');
watch(loading, (value) => {
  layoutLoading.value = value;
});

const { runAsync: clickRun } = useRequest(clickArticleService, {
  defaultParams: [null],
});

const jump = async (id) => {
  loading.value = true;
  await clickRun(id);
  await router.push({path: '/article', query: { id: id }});
}
</script>

<template>
  <div>
    <v-item-group v-if="articles" :multiple="true">
      <v-container>
        <v-row>
          <v-col v-for="article in articles.records" class="d-flex justify-center" cols="12">
            <v-item v-slot="{ isSelected, toggle }">
              <v-card max-width="800" height="220" class="card w-100 h-100 elevation-4" @click="jump(article.id)">
                <v-img class="align-end" :src="article.thumbnail ? article.thumbnail : bg" height="220" cover>
                  <template v-slot:placeholder>
                    <v-row class="fill-height ma-0" align="center" justify="center">
                      <v-progress-circular indeterminate color="primary" />
                    </v-row>
                  </template>
                  <v-container class="overlay w-100 h-100 text-center">
                    <v-row align="center" style="height: 180px" no-gutters>
                      <v-col cols="12">
                        <p class="title ls-1">{{ article.title }}</p>
                      </v-col>
                      <v-col v-if="article.subtitle" cols="12">
                        <p class="subtitle ls-3">{{ article.subtitle }}</p>
                      </v-col>
                      <v-col cols="12">
                        <p class="data ls-2">
                          <v-icon class="mr-2" icon="mdi-read" size="small"></v-icon>
                          <span class="mr-3">点击量 {{ article.clicked }} 次</span>
                          <span v-if="article.edited">
                          <v-icon class="mr-1" size="small">mdi-update</v-icon>
                          更新于 {{ formatDate(article.edited) }}
                        </span>
                          <span v-else>
                          <v-icon class="mr-1" size="small">mdi-draw-pen</v-icon>
                          发表于 {{ formatDate(article.time) }}
                        </span>
                        </p>
                      </v-col>
                      <v-col v-if="article.tags.length > 0" cols="12">
                        <v-btn class="px-6" size="x-large" density="compact" variant="tonal" @click.stop="toggle">
                          <v-icon size="large">
                            {{ isSelected ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                          </v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-img>

                <v-expand-transition>
                  <div v-show="isSelected" class="w-100">
                    <v-divider />
                    <v-container
                        style="background: linear-gradient(to right, #FED504, #03DAC6)" class="w-100 pa-2">
                      <v-row justify="start" no-gutters>
                        <v-col v-for="tag in article.tags" class="my-1" cols="auto" >
                          <v-chip class="mr-3 pa-4" style="background-color: #111; font-size: .8rem">
                            {{ tag.name }}
                          </v-chip>
                        </v-col>
                      </v-row>
                    </v-container>
                  </div>
                </v-expand-transition>
              </v-card>
            </v-item>
          </v-col>
        </v-row>
      </v-container>
      <v-alert v-if="articles.records.length < 1" color="primary" icon="mdi-flask-empty-outline" density="compact">
        这里空空如也~去别的地方看看吧！
      </v-alert>
    </v-item-group>

    <v-alert v-if="!articles"
        class="w-auto mx-auto"
        max-width="400"
        color="primary"
        icon="mdi-hand-okay"
        density="compact">
      正在努力加载..<span class="ml-4">ᓚᘏᗢ</span>
    </v-alert>
    <div v-else class="text-center mb-4">
      <v-pagination v-model="current" size="small" :disabled="loading" :length="totalPage" :total-visible="6" />
    </div>
  </div>
</template>

<style scoped>
.card {
  transition: transform .2s ease-in-out, border .5s ease-in-out;
}
.card:hover {
  transform: translateX(3px);
  border: 2px solid #03DAC6;
}
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  background-color: #00000050;
  z-index: 1;
  text-shadow: 0 0 5px black;
  color: #FED504;
  .title {
    font-size: 1.5rem;
    font-weight: bold;
  }
  .subtitle {
    font-size: 1rem;
    color: white;
  }
  .data {
    font-size: .8rem;
    color: lightgrey;
  }
}
</style>