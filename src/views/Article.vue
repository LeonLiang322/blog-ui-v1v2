<script setup>
import {inject, onMounted, ref, watch} from 'vue';
import {useRequest} from 'vue-request';
import req from '@/utils/handleReq';
import {useRoute} from 'vue-router';
import 'github-markdown-css/github-markdown-dark.css'
import '/src/assets/css/markdown.css'

const articleClickService = async (id) => {
  return await req.sys.patch('/articles/click/' + id);
}
const getArticleByIdService = async (id) => {
  // await req.sys.patch('/articles/click/' + id);
  const results = await req.sys.get('/articles/' + id);
  return results.data.data;
};

const formatDate = (date) => {
  const temp = new Date(date);
  const year = temp.getFullYear();
  const month = temp.getMonth() + 1;
  const dates = temp.getDate();
  const arr = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const day = temp.getDay();
 return year + '年' + month + '月' + dates + '日 ' + arr[day];
}

const items = ref([
  {
    title: '所有文章',
    disabled: false,
    href: 'articles'
  },
])

const id = useRoute().query.id;

// 根据ID获取文章
const {
  data: article,
  run: getRun,
  loading: articleLoading
} = useRequest(getArticleByIdService, {
  defaultParams: [id],
  cacheKey: 'article',
  cacheTime: 5 * 60 * 1000,
  onSuccess: () => {
    article.value.time = formatDate(article.value.time)
    if (article.value.edited) {
      article.value.edited = formatDate(article.value.edited)
    }
    items.value.push({
      title: article.value.title,
      disabled: true,
      href: ''
    });
    document.title = "乱写的文章 | " + article.value.title;

  },
});

const layoutLoading = inject('layoutLoading');
watch(articleLoading, (value) => {
  layoutLoading.value = value;
});

getRun(id);

const input = ref('');
const rules = {
  limit: value => value.length < 50 || '最多只能写五十个字哦~',
}

onMounted(() => {
  document.title = "乱写的文章 | 加载中...";
});
</script>

<template>
  <div v-if="article">
    <v-breadcrumbs :items="items" class="ls-1">
      <template v-slot:prepend>
        <v-icon size="large" icon="mdi-menu-left-outline"></v-icon>
      </template>
    </v-breadcrumbs>
    <v-sheet
        class="top w-100 pa-2 text-center ls-2"
        :elevation="4"
        border
        rounded>
      <h1 class="my-4 text-primary ls-4">{{ article.title }}</h1>
      <h3 class="mb-6">{{ article.subtitle }}</h3>
      <v-divider></v-divider>
      <v-container class="pa-2 pt-4">
        <v-row class="text-grey-darken-1" justify="center" style="font-size: 14px">
          <v-col class="d-flex justify-center align-center">
            <v-icon class="mr-3" icon="mdi-eye" size="small" />
            <span class="mr-5 text-no-wrap">{{ article.clicked }} 次浏览</span>
          </v-col>
          <v-col class="d-flex justify-center align-center">
            <v-tooltip location="bottom">
              <p class="ls-2">创建于 {{ article.time }}</p>
              <template v-slot:activator="{ props }">
                <v-icon class="mr-3" icon="mdi-pen" size="small" />
                <span v-bind="props" v-if="article.edited" class="mr-5 text-no-wrap">编辑于 {{ article.edited }}</span>
                <span v-else class="mr-5 text-no-wrap">创建于 {{ article.time }}</span>
              </template>
            </v-tooltip>
          </v-col>
          <v-col class="d-flex justify-center align-center">
            <p v-if="article.tags.length === 0">
              <v-icon size="small">mdi-tag</v-icon>
              -未添加标签-
            </p>
            <v-slide-group show-arrows>
              <v-slide-group-item
                  v-for="(tag, index) in article.tags"
                  :key="index"
                  v-slot="{ isSelected, toggle }">
                <v-chip class="ma-1" variant="elevated" size="small" rounded>
                  {{ tag.name }}
                </v-chip>
              </v-slide-group-item>
            </v-slide-group>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>

    <v-sheet
        class="w-100 pa-6 my-4"
        :elevation="4"
        border
        rounded>
      <div class="markdown-body text-justify" v-html="article.content" v-viewer/>
      <div class="mt-6 text-end">
        <v-tooltip text="如需转载，请先与作者联系取得授权，并在转载处注明出处" location="bottom" width="200">
          <template v-slot:activator="{ props }">
            <span v-bind="props">© 著作权归作者所有</span>
          </template>
        </v-tooltip>
      </div>
    </v-sheet>

    <v-sheet
        class="w-100 h-auto pa-6"
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
    </v-sheet>
  </div>
</template>

<style scoped>
/*.markdown-body {*/
/*  font-family: 'HarmonySans', sans-serif;*/
/*  background-color: transparent;*/
/*}*/
</style>