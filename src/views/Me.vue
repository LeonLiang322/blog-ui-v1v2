<script setup>
import req from "@/utils/RequestUtil";
import { useLoadMore } from "vue-request";
import { inject, ref, watch } from "vue";
import router from "@/router";
import {formatDate, formatOnlyDate} from "@/utils/DateUtil";
const panel = ref(null);

const getSentencesService = async (data) => {
  const _page = data?.page ? data.page + 1 : 1;
  const result = await req.sys.get('/sentences/page', { page: _page, size: 10 });
  return {
    list: result.data.data.records,
    page: _page,
    total: result.data.data.pages,
  }
}

const getVersionsService = async (data) => {
  const _page = data?.page ? data.page + 1 : 1;
  const result = await req.sys.get('/general/versions', { page: _page, size: 3 });
  return {
    list: result.data.data.records,
    page: _page,
    total: result.data.data.pages,
  }
}

const {
  dataList: versions,
  loadingMore: vLoadingMore,
  noMore: vNoMore,
  loadMore: vLoadMore
} = useLoadMore(getVersionsService, {
  manual: false,
  isNoMore: (d) => {
    return d?.page === d?.total;
  },
});

const colors = ['green', 'blue', 'yellow', 'orange', 'red'];

const {
  dataList: sentences,
  loadingMore: sLoadingMore,
  noMore: sNoMore,
  loadMore: sLoadMore,
} = useLoadMore(getSentencesService, {
  manual: false,
  isNoMore: (d) => {
    return d?.page === d?.total;
  },
});

const localPanel = localStorage.getItem('panel');
if (localPanel) {
  panel.value = JSON.parse(localPanel);
} else {
  panel.value = [0, 1, 2];
}
watch(panel, (value) => {
  localStorage.setItem('panel', JSON.stringify(value));
});

const jump = (path, query) => {
  router.push({path: path, query: query});
}

</script>

<template>
  <div>
    <div class="box mb-4 pt-4 pb-6 rounded text-center overflow-hidden">
      <div class="lean-box d-flex">
        <div class="wrapper">
          <div class="icon-pair " v-for="i in 8" :key="i">
            <div class="icon rainbow-font">Hello~</div>
            <div class="icon rainbow-font-reverse">(｡･∀･)ﾉﾞ</div>
            <div class="icon rainbow-font">Hello~</div>
            <div class="icon rainbow-font-reverse">(｡･∀･)ﾉﾞ</div>
          </div>
        </div>
      </div>
    </div>
    <v-expansion-panels
        v-model="panel"
        :multiple="true"
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
              从零开始纯手撸的。<br>
              <span class="text-decoration-line-through mr-1">感觉前端UI框架没选好，以后再来重构吧</span>
              <span style="text-decoration: line-through">开摆了</span>
               好吧我还真重构了🤦‍♂️
              <v-table class="mt-5 ls-1 bg-transparent text-no-wrap">
                <tbody>
                <tr>
                  <td>后端</td>
                  <td>
                    <v-chip-group class="pa-0 justify-end">
                      <v-chip target="_blank" href="https://spring.io/">Spring Boot</v-chip>
                      <v-chip target="_blank" href="https://baomidou.com/">MyBatis Plus</v-chip>
                    </v-chip-group>
                  </td>
                </tr>
                <tr>
                  <td>前端</td>
                  <td>
                    <v-chip-group class="pa-0 justify-end">
                      <v-chip target="_blank" href="https://vuejs.org/">Vue 3</v-chip>
                      <v-chip target="_blank" href="https://vuetifyjs.com/">Vuetify UI</v-chip>
                      <v-chip class="text-decoration-line-through" target="_blank" href="https://www.antdv.com/">
                        Ant Design UI
                      </v-chip>
                    </v-chip-group>
                  </td>
                </tr>
                <tr>
                  <td>数据库</td>
                  <td>
                    <v-chip-group class="pa-0 justify-end">
                      <v-chip target="_blank" href="https://www.mysql.com/">MySQL</v-chip>
                      <v-chip class="text-decoration-line-through" target="_blank" href="https://redis.io/">Redis</v-chip>
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
              <v-timeline class="overflow-auto py-2" side="end" align="start" truncate-line="both">
                <v-timeline-item
                    v-for="version in versions"
                    density="compact"
                    :dot-color="colors[version.level]"
                    size="x-small"
                    fill-dot>
                  <div class="d-inline-flex text-no-wrap">
                    <div style="width: 90px">{{ formatOnlyDate(version.date) }}</div>
                    <div style="width: 50px" class="mx-4 text-primary text-decoration-underline ls-2">V {{ version.version }}</div>
                    <span>{{ version.detail }}</span>
                  </div>
                </v-timeline-item>
                <v-timeline-item
                    v-if="!vNoMore"
                    density="compact"
                    dot-color="white"
                    icon="mdi-dots-vertical"
                    size="16"
                    fill-dot>
                  <v-btn class="mt-n2" size="small" :loading="vLoadingMore" @click="vLoadMore">更早</v-btn>
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
          动态
        </v-expansion-panel-title>
        <v-expansion-panel-text class="pa-0">
          <v-progress-circular v-if="!sentences" class="mt-2" indeterminate color="primary"/>
          <p v-if="sentences.length === 0" class="my-4">还没有吐槽过呢...</p>
          <v-timeline
              v-else
              class="justify-start mt-2"
              :class="sNoMore ? 'pb-3' : ''"
              density="compact"
              side="end"
              :truncate-line="sNoMore ? 'both' : 'start'">
            <v-timeline-item
                v-for="sentence in sentences"
                size="small"
                dot-color="primary"
                icon="mdi-emoticon-kiss-outline"
                fill-dot>
              <v-card class="mb-n1 px-4" color="background">
                <v-card-text class="pa-3">
                  <p style="font-size: 1rem" class="ls-1">{{sentence.content}}</p>
                  <v-icon size="x-small" color="grey">mdi-calendar-today-outline</v-icon>
                  <span class="ml-1 ls-1 text-grey">{{ formatDate(sentence.date) }}</span>
                </v-card-text>
              </v-card>
            </v-timeline-item>
            <v-timeline-item
                size="small"
                dot-color="primary"
                icon="mdi-emoticon-kiss-outline"
                fill-dot>
              <v-btn v-if="!sNoMore" density="comfortable" @click="sLoadMore" :loading="sLoadingMore">更多</v-btn>
              <p v-else class="ls-1">没有啦~</p>
            </v-timeline-item>
          </v-timeline>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<style scoped>
.box {
  height: 200px;
}
.icon {
  letter-spacing: 10px;
  width: 300px;
  font-size: 55px;
}
.lean-box {
  transform: rotate(-15deg);
}
.wrapper {
  margin-top: -80px;
  display: flex;
  flex-wrap: nowrap;
  animation: row-up 10s linear infinite;
}
.wrapper .icon:nth-child(even) {
  margin-top: 5px;
  margin-bottom: 5px;
  transform: translate(-160px);
}
.icon-pair {
  margin-left: 20px;
}
.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}


a {
  cursor: pointer;
}
.v-expansion-panel-title {
  height: 40px;
}
.v-card-text {
  line-height: 1.5rem;
}
@keyframes row-up {
  from {
    transform: translateX(0%);
  }

  to {
    transform: translateX(-50%);
  }
}

</style>