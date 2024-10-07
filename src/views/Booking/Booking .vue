<template>
  <div>
    <h2 class="mb-4">Đặt sân bóng</h2>
    <div class="row">
      <!-- Card sân bóng -->
      <div class="col-md-4" v-for="field in fields" :key="field.id">
        <div class="card mb-4">
          <img :src="field.image" class="card-img-top" alt="Sân bóng" />
          <div class="card-body">
            <h5 class="card-title">{{ field.name }}</h5>
            <p class="card-text">{{ field.description }}</p>
            <router-link :to="'/booking/' + field.id" class="btn btn-primary"
              >Đặt sân</router-link
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Booking",
  data() {
    return {
      fields: [
        {
          id: 1,
          name: "Sân bóng A",
          description: "Sân 5 người, cỏ nhân tạo chất lượng cao",
          image: "https://via.placeholder.com/300x200",
        },
        {
          id: 2,
          name: "Sân bóng B",
          description: "Sân 7 người, có đèn chiếu sáng ban đêm",
          image: "https://via.placeholder.com/300x200",
        },
        {
          id: 3,
          name: "Sân bóng C",
          description: "Sân 11 người, tiêu chuẩn thi đấu",
          image: "https://via.placeholder.com/300x200",
        },
      ],
    };
  },
};
</script>

<style scoped>
.card-img-top {
  height: 200px;
  object-fit: cover;
}
</style>
