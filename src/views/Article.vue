<script setup>
import {inject, ref, watch} from 'vue';
import {useRequest} from 'vue-request';
import req from '@/utils/RequestUtil';
import {useRoute} from 'vue-router';
import 'github-markdown-css/github-markdown-dark.css'
import '/src/assets/css/markdown.css'
import {formatDate} from "@/utils/DateUtil";
import router from "@/router";

const getArticleByIdService = async (id) => {
  console.log(id)
  const results = await req.sys.get('/articles/' + id);
  return results.data.data;
};

const items = ref([
  {
    title: '所有文章',
    disabled: false,
  },
])

const id = useRoute().query.id;

// 根据ID获取文章
const {
  data: article,
  run: getRun,
  loading: articleLoading
} = useRequest(getArticleByIdService, {
  defaultParams: [null],
  cacheKey: 'article_' + id,
  cacheTime: 60 * 60 * 1000,
  onSuccess: () => {
    items.value.push({
      title: article.value.title,
      disabled: false,
    });
    article.value.time = formatDate(article.value.time)
    if (article.value.edited) {
      article.value.edited = formatDate(article.value.edited)
    }
    document.title = article.value.title;
  },
});

if (id) {
  getRun(id);
}

const layoutLoading = inject('layoutLoading');
watch(articleLoading, (value) => {
  layoutLoading.value = value;
});

// getRun(id);

const input = ref('');
const rules = {
  limit: value => value.length < 50 || '最多只能写五十个字哦~',
}

</script>

<template>
  <div>
    <v-sheet v-if="article" class="mx-auto bg-transparent" max-width="800">
      <v-card
          class="w-auto mb-4"
          max-width="400"
          color="primary"
          density="compact"
          @click="router.push('/articles')">
        <v-breadcrumbs density="compact" :items="items" class="ls-1 text-white">
          <template v-slot:prepend>
            <v-icon size="large" icon="mdi-menu-left"></v-icon>
          </template>
        </v-breadcrumbs>
      </v-card>
      <v-card
          class="w-100 pa-2 text-center ls-2 bg-background"
          :elevation="4"
          border
          rounded>
        <h1 class="text-primary mt-1 ls-2">{{ article.title }}</h1>
        <h4 class="mt-1">{{ article.subtitle }}</h4>
        <v-divider class="mt-3"></v-divider>
        <v-container class="pa-2 pt-3" style="font-size: .8rem">
          <v-row class="text-grey-darken-1" justify="center">
            <v-col cols="12" sm="4" class="py-1 d-flex justify-center align-center">
              <v-icon class="mr-3" icon="mdi-eye" size="small" />
              <span class="mr-5 text-no-wrap">{{ article.clicked }} 次浏览</span>
            </v-col>
            <v-col cols="12" sm="4" class="py-1 d-flex justify-center align-center">
              <v-tooltip location="bottom">
                <p class="ls-2">创建于 {{ article.time }}</p>
                <template v-slot:activator="{ props }">
                  <v-icon class="mr-3" icon="mdi-pen" size="small" />
                  <span v-bind="props" v-if="article.edited" class="mr-5 text-no-wrap">编辑于 {{ article.edited }}</span>
                  <span v-else class="mr-5 text-no-wrap">创建于 {{ article.time }}</span>
                </template>
              </v-tooltip>
            </v-col>
            <v-col cols="12" sm="4" class="py-1 d-flex justify-center align-center">
              <p v-if="article.tags.length === 0">
                <v-icon size="small">mdi-tag</v-icon>
                -未添加标签-
              </p>
              <v-slide-group show-arrows>
                <v-slide-group-item
                    v-for="tag in article.tags"
                    v-slot="{ isSelected, toggle }">
                  <v-chip class="ma-1" size="small">
                    {{ tag.name }}
                  </v-chip>
                </v-slide-group-item>
              </v-slide-group>
            </v-col>
          </v-row>
        </v-container>
      </v-card>

      <v-card
          class="w-100 pa-6 my-4 bg-background"
          :elevation="4"
          border
          rounded>
        <div class="markdown-body text-justify" v-html="article.content" v-viewer />
        <div class="mt-6 text-end">
          <v-tooltip text="如需转载，请先与作者联系取得授权，并在转载处注明出处" location="bottom" width="200">
            <template v-slot:activator="{ props }">
              <span v-bind="props">© 著作权归作者所有</span>
            </template>
          </v-tooltip>
        </div>
      </v-card>

      <v-card
          class="w-100 h-auto pa-6 bg-background"
          :elevation="4"
          border
          rounded>
        <v-textarea
            :disabled="true"
            :model-value="input"
            :rules="[rules.limit]"
            placeholder="请文明发言哦~"
            maxlength="200"
            counter
            auto-grow
            rows="1"
            row-height="15"
            variant="solo-filled">
          <template v-slot:label>
            <!--<p class="ls-1">简单评论一下</p>-->
            <p class="ls-1">评论功能正在施工中哦~</p>
          </template>
          <template v-slot:prepend-inner>
            <v-icon class="mr-3" icon="mdi-comment" />
          </template>
        </v-textarea>
      </v-card>
    </v-sheet>

    <v-alert
        v-else
        class="w-auto mx-auto"
        max-width="400"
        color="primary"
        icon="mdi-hand-okay"
        density="compact">
      正在努力加载..<span class="ml-4">ᓚᘏᗢ</span>
    </v-alert>
  </div>
</template>

<style scoped>

</style>