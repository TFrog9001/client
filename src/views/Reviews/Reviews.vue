<template>
  <div class="container">
    <div class="review-box">
      <h2>Đánh giá về dịch vụ của sân bóng</h2>

      <!-- Rating Summary -->
      <div class="rating-summary">
        <div class="average-rating">
          <span class="rating-value">{{ averageRating }}</span>
          <v-rating
            v-model="averageRating"
            :max="5"
            :readonly="true"
            active-color="orange-lighten-1"
            color="orange"
          ></v-rating>
          <span class="rating-count">({{ comments.length }} reviews)</span>
        </div>
      </div>

      <!-- Filter by rating -->
      <div class="filter-rating">
        <label for="filter">Filter by rating:</label>
        <select id="filter" v-model="filterRating" @change="applyFilter">
          <option value="">All</option>
          <option v-for="star in 5" :key="star" :value="star">
            {{ star }} star
          </option>
        </select>
      </div>

      <!-- Reviews List -->
      <div class="reviews-list">
        <div
          v-for="(comment, index) in filteredComments"
          :key="index"
          class="review-item"
        >
          <div class="user-info">
            <img
              :src="comment.user.avatar || defaultAvatar"
              alt="User Avatar"
              class="avatar"
            />
            <span class="user-name">{{ comment.user.name }}</span>
          </div>
          <div class="review-text">
            <p>{{ comment.content }}</p>
          </div>
          <div class="review-time">{{ formatDate(comment.created_at) }}</div>
          <div class="star-rating">
            <v-rating
              v-model="comment.rate"
              :max="5"
              :readonly="true"
              active-color="orange-lighten-1"
              color="orange"
            ></v-rating>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "../../axios/api.js";

const comments = ref([]);
const filteredComments = ref([]);
const defaultAvatar =
  "https://cdn3.iconfinder.com/data/icons/business-avatar-1/512/3_avatar-512.png";
const filterRating = ref("");

// Tính điểm trung bình
const averageRating = computed(() => {
  if (comments.value.length === 0) return 0;
  const totalRating = comments.value.reduce(
    (sum, comment) => sum + comment.rate,
    0
  );
  return (totalRating / comments.value.length).toFixed(1);
});

// Fetch reviews
const fetchComments = async () => {
  try {
    const response = await api.get("/reviews");
    comments.value = response.data.filter((comment) => comment.hidden !== 1);
    filteredComments.value = [...comments.value];
  } catch (error) {
    console.error("Error fetching reviews:", error);
  }
};

// Lọc theo rating
const applyFilter = () => {
  if (!filterRating.value) {
    filteredComments.value = [...comments.value];
  } else {
    filteredComments.value = comments.value.filter(
      (comment) => comment.rate === parseInt(filterRating.value)
    );
  }
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

onMounted(() => {
  fetchComments();
});
</script>

<style scoped>
.review-box {
  background: #f9f9f9;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin: 20px auto;
  max-width: 1100px;
}

h2 {
  text-align: center;
  font-size: 32px;
  color: #333;
  margin-bottom: 20px;
  font-weight: 600;
}

.reviews-list {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 10px;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.review-item {
  background: #fff;
  padding: 20px;
  margin-bottom: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.review-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.user-info .avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 15px;
  border: 2px solid #f1f1f1;
}

.user-info .user-name {
  font-weight: bold;
  font-size: 18px;
  color: #333;
}

.review-text p {
  font-size: 16px;
  color: #555;
  margin: 15px 0;
}

.review-time {
  font-size: 14px;
  color: #888;
}

.star-rating {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 10px;
  gap: 5px;
}

.star-rating span {
  font-size: 14px;
  color: #666;
}

/* Scrollbar styling */
.reviews-list::-webkit-scrollbar {
  width: 8px;
}

.reviews-list::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}

.reviews-list::-webkit-scrollbar-thumb:hover {
  background-color: #aaa;
}

.rating-summary {
  text-align: center;
  margin-bottom: 20px;
}

.rating-summary .average-rating {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 18px;
}

.rating-summary .rating-value {
  font-size: 28px;
  font-weight: bold;
  color: #ffa500;
}

.rating-summary .rating-count {
  font-size: 14px;
  color: #888;
}

.filter-rating {
  text-align: center;
  margin-bottom: 20px;
}

.filter-rating label {
  font-size: 16px;
  margin-right: 10px;
  color: #555;
}

.filter-rating select {
  padding: 8px 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ddd;
  outline: none;
}
</style>
