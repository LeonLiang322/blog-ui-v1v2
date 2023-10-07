import { createRouter, createWebHistory } from 'vue-router'
import Layout from "@/layout/Layout.vue";
// import Home from "@/views/Home.vue";
import Articles from "@/views/Articles.vue";
import Article from "@/views/Article.vue";
import Photos from "@/views/Photos.vue";
import Error from "@/views/Error.vue";
import Me from "@/views/Me.vue";
import Board from "@/views/Board.vue";
import AdminLayout from "@/layout/AdminLayout.vue";
import AdminArticles from "@/views/admin/Articles.vue"
import AdminPhotos from "@/views/admin/Photos.vue"
import AdminJournals from "@/views/admin/Journals.vue"
import AdminTags from "@/views/admin/Tags.vue"
import AdminVersions from "@/views/admin/Versions.vue"

const routes = [
  {
    path: '/',
    redirect: '/articles'
  },
  {
    path: '/admin',
    redirect: '/admin/articles'
  },


  {
    path: '/layout',
    component: Layout,
    children: [
      {
        path: '/articles',
        component: Articles,
        meta: {
          title: '乱写的文章'
        }
      },{
        path: '/article',
        component: Article,
        meta: {
          title: '乱写的文章'
        }
      },{
        path: '/photos',
        component: Photos,
        meta: {
          title: '瞎拍的照片'
        }
      },{
        path: '/me',
        component: Me,
        meta: {
          title: '博客与我'
        }
      },{
        path: '/board',
        component: Board,
        meta: {
          title: '留言板'
        }
      },{
        path: '/error',
        component: Error,
        meta: {
          title: '出错了(⌐■_■)'
        }
      }
    ]
  },

  {
    path: '/admin/layout',
    component: AdminLayout,
    children: [
      {
        path: '/admin/articles',
        component: AdminArticles,
        meta: {
          title: '管理 | 文章'
        }
      }, {
        path: '/admin/photos',
        component: AdminPhotos,
        meta: {
          title: '管理 | 照片'
        }
      }, {
        path: '/admin/journals',
        component: AdminJournals,
        meta: {
          title: '管理 | 动态'
        }
      }, {
        path: '/admin/tags',
        component: AdminTags,
        meta: {
          title: '管理 | 标签'
        }
      }, {
        path: '/admin/versions',
        component: AdminVersions,
        meta: {
          title: '管理 | 版本'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
