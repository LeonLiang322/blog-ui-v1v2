import { createRouter, createWebHistory } from 'vue-router'
import Layout from "@/layout/Layout.vue";
import Home from "@/views/Home.vue";
import Articles from "@/views/Articles.vue";
import Article from "@/views/Article.vue";
import Photos from "@/views/Photos.vue";
import Error from "@/views/Error.vue";
import Me from "@/views/Me.vue";
import Test from "@/views/Test.vue";
import Board from "@/views/Board.vue";
import AdminLayout from "@/layout/AdminLayout.vue";
import AdminArticles from "@/views/admin/Articles.vue"
import AdminPhotos from "@/views/admin/Photos.vue"
import AdminTags from "@/views/admin/Tags.vue"


const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/admin',
    redirect: '/admin/articles'
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
  },

  {
    path: '/layout',
    component: Layout,
    children: [
      {
        path: '/articles',
        component: Articles
      },{
        path: '/article',
        component: Article
      },{
        path: '/photos',
        component: Photos
      },{
        path: '/me',
        component: Me
      },{
        path: '/board',
        component: Board
      },{
        path: '/error',
        component: Error,
        meta: {
          title: '出错了哎(⌐■_■)'
        }
      },{
        path: '/test',
        component: Test,
      }
    ]
  },

  {
    path: '/admin/layout',
    component: AdminLayout,
    children: [
      {
        path: '/admin/articles',
        component: AdminArticles
      }, {
        path: '/admin/photos',
        component: AdminPhotos
      }, {
        path: '/admin/sentences',
        component: AdminArticles
      }, {
        path: '/admin/tags',
        component: AdminTags
      }, {
        path: '/admin/articles',
        component: AdminArticles
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
