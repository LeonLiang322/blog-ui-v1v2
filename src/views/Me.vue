<script setup>
import req from "@/utils/handleReq";
import {useLoadMore, useRequest} from "vue-request";
import {computed, inject, onMounted, ref, watch} from "vue";
import router from "@/router";
const panel = ref(null);

const getSentencesService = async (data) => {
  const _page = data?.page ? data.page + 1 : 1;
  const result = await req.sys.get('/sentences', {page: _page, size: 10});
  return {
    list: result.data.data.records,
    page: _page,
    total: result.data.data.pages,
  }
}
const getVersionService = async () => {
  const result =  await req.sys.get('/general/version');
  return result.data.data;
}

const {
  data: versions,
  loading: versionLoading
} = useRequest(getVersionService, {
  manual: false
})

const colors = ['green', 'blue', 'yellow', 'orange', 'red'];

const {
  data,
  dataList: sentences,
  loading,
  loadingMore,
  noMore,
  loadMore,
} = useLoadMore(getSentencesService, {
  manual: false,
  isNoMore: (d) => {
    return d?.page === d?.total;
  },
  onSuccess: () => {
    setTimeout(() => {
      panel.value = [2];
    }, 200)
  }
});

const layoutLoading = inject('layoutLoading');
watch(loading, (value) => {
  layoutLoading.value = value;
});

const jump = (path, query) => {
  router.push({path: path, query: query});
}

onMounted(() => {
  document.title = "L1am的熬夜空间 | 我与这个博客"
});
</script>

<template>
  <div>
    <v-sheet class="mb-4 pt-4 pb-6 rounded text-center ls-3">
      <div class="greeting text-h5 my-2">Hiiya~</div>
      <div class="text-h4 d-inline">这里是L1am Liang </div>
      <span>( ′ 3`)</span>
    </v-sheet>
    <v-divider class="my-4"></v-divider>
    <v-expansion-panels
        v-model="panel"
        :multiple="true"
        variant="popout"
        mandatory
        class="my-4">
      <v-expansion-panel key="blog">
        <v-expansion-panel-title
            class="text-h6"
            color="primary"
            collapse-icon="mdi-draw-pen">
          关于本博客
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-card class="pa-2 my-4" color="background">
            <v-card-title class="text-primary">
              为什么要建这个博客？
            </v-card-title>
            <v-card-text>
              <p>当然是自己建着玩呗~</p>
              <!--<p>想了解的话看看这篇文章咯 =>-->
              <!--  <a-->
              <!--      class="text-primary font-weight-bold text-decoration-underline font-italic"-->
              <!--      @click="jump('/article', {id: 1})">-->
              <!--    这个博客没有故事-->
              <!--  </a>-->
              <!--</p>-->
            </v-card-text>
          </v-card>
          <v-card class="pa-2 mb-4" color="background">
            <v-card-title class="text-primary">
              这个博客怎么建的？
            </v-card-title>
            <v-card-text>
              前后端分离，只用了几个简单的框架（但还是有一堆bug，我大学学了个寂寞？）<br>
              <span style="text-decoration: line-through">要是以后学了啥更好用的再来重构吧~</span>
               &lt= 我懒死了咋会做这种事儿
              <v-table class="mt-5 ls-1 bg-transparent text-no-wrap">
                <tbody>
                <tr>
                  <td>后端随便写写咯</td>
                  <td>
                    <v-chip-group class="pa-0 justify-end">
                      <v-chip target="_blank" href="https://spring.io/">Spring Boot</v-chip>
                      <v-chip target="_blank" href="https://baomidou.com/">MyBatis Plus</v-chip>
                    </v-chip-group>
                  </td>
                </tr>
                <tr>
                  <td>前端再学了几个</td>
                  <td>
                    <v-chip-group class="pa-0 justify-end">
                      <v-chip target="_blank" href="https://vuejs.org/">Vue 3</v-chip>
                      <v-chip target="_blank" href="https://vuetifyjs.com/">Vuetify UI</v-chip>
                      <v-chip target="_blank" href="https://www.antdv.com/">Ant Design UI</v-chip>
                    </v-chip-group>
                  </td>
                </tr>
                <tr>
                  <td>数据库捣鼓一下</td>
                  <td>
                    <v-chip-group class="pa-0 justify-end">
                      <v-chip target="_blank" href="https://www.mysql.com/">MySQL 8</v-chip>
                      <v-chip target="_blank" href="https://redis.io/">Redis</v-chip>
                    </v-chip-group>
                  </td>
                </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
          <v-card class="pa-2" color="background">
            <v-card-title class="text-primary">
              《更新日志》
            </v-card-title>
            <v-card-text v-if="versions" class="d-flex justify-start mt-4">
              <p v-if="versions.length === 0">什么？怎么可能没有版本更新记录！！一定是系统又出Bug了(っ °Д °;)っ</p>
              <v-timeline class="overflow-auto mt-1 py-2" side="end" align="start" truncate-line="both">
                <v-timeline-item
                    v-for="version in versions"
                    :dot-color="colors[version.level]"
                    size="16"
                    fill-dot>
                  <div class="text-no-wrap mt-n1">
                    <span>{{ version.date }}</span>
                    <v-chip
                        class="mx-4 align-self-center mt-n1"
                        variant="outlined"
                        rounded
                        size="small">V {{ version.version }}</v-chip>
                    <span>{{ version.detail }}</span>
                  </div>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>
          </v-card>
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel key="me">
        <v-expansion-panel-title
            class="text-h6"
            color="primary"
            collapse-icon="mdi-badge-account-horizontal">
          关于我
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-card class="pa-2 my-4" color="background">
            <v-card-title class="text-primary">我</v-card-title>
            <v-card-text>这个人真的懒得要死，连自我介绍都不想写（以后一定写(╯°□°）╯︵ ┻━┻）</v-card-text>
          </v-card>
          <v-card class="pa-2" color="background">
            <v-card-title class="text-primary">平时都在干些啥？</v-card-title>
            <v-card-text>
              当然是玩游戏啦！！！不过最近电子羊萎了<br>欢迎扩列~
              <v-card class="mx-auto mt-2">
                <template v-slot:title>
                  <p class="ls-1" style="font-size: 1rem">Steam</p>
                </template>
                <template v-slot:prepend>
                  <v-icon color="blue">mdi-steam</v-icon>
                </template>
                <v-card-text>
                  <v-btn class="w-100 text-truncate"
                         style="font-family: SmileySans, serif"
                         href="https://steamcommunity.com/id/109904/"
                         target="_blank">
                    我的Steam个人资料
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-card-text>
          </v-card>
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel key="sentence">
        <v-expansion-panel-title
            class="text-h6"
            color="primary"
            collapse-icon="mdi-comment">
          日常吐槽
        </v-expansion-panel-title>
        <v-expansion-panel-text class="pa-0">
          <p v-if="sentences.length === 0" class="my-4">还没有吐槽过呢...</p>
          <v-timeline
              v-else
              side="end"
              :truncate-line="noMore ? 'both' : 'start'"
              class="justify-start mt-2">
            <v-timeline-item
                v-for="sentence in sentences"
                :key="sentence.id"
                size="small"
                dot-color="primary"
                icon="mdi-emoticon-kiss-outline"
                fill-dot>
              <p class="ma-1 ls-1">{{ sentence.date }}</p>
              <v-card class="pa-0" color="background">
                <v-card-text class="pa-3">{{sentence.content}}</v-card-text>
              </v-card>
            </v-timeline-item>
            <v-timeline-item
                size="small"
                dot-color="primary"
                icon="mdi-emoticon-kiss-outline"
                fill-dot>
              <v-btn v-if="!noMore" @click="loadMore" :loading="loadingMore">更多</v-btn>
              <p v-else class="ls-1">已经到达这个世界的尽头啦~</p>
            </v-timeline-item>
          </v-timeline>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

  </div>
</template>

<style scoped>
.greeting {
  animation: rainbow 5s alternate infinite forwards;
}
a {
  cursor: pointer;
  font-family: 'HarmonySans', sans-serif;
}
.v-expansion-panel-title {
  height: 40px;
}
.v-card-text {
  font-family: 'HarmonySans', sans-serif;
  line-height: 1.5rem;
}
@keyframes rainbow {
  0% {
    color: #64FFDA;
  }
  50% {
    color: #FED504;
  }
  100% {
  color: #76FF03;
}
}
</style>