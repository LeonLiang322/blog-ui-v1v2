<script setup>
import {JSEncrypt} from "jsencrypt";
import req from "@/utils/handleReq";
import {useRequest} from "vue-request";

const getPublicKeyService = async () => {
  const result = await req.sys.get('/users/key');
  console.log(result)
  return result.data.data;
}

const {
  data,
  run: getKeyRun,
  loading: getKeyLoading
} = useRequest(getPublicKeyService, {
  onSuccess: (resp) => {
    let publicKey = resp;
    if (publicKey) {
      let encrypt = new JSEncrypt();
      encrypt.setPublicKey(publicKey);
      let password = '123456';
      password = encrypt.encrypt(password);
      console.log(password)

    }
  }

});

getKeyRun();


</script>

<template>
  <div class="overflow-auto">{{ data }}</div>
</template>

<style scoped>

</style>