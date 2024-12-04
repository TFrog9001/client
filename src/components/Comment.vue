<template>
  <div class="comment-box">
    <div class="comments-list">
      <div
        v-for="(comment, index) in comments"
        :key="index"
        class="comment-item"
        :class="{ 'comment-hidden': comment.hidden === 1 }"
      >
        <div class="user-info">
          <img
            :src="getStaffAvatar(comment.user.avatar) || defaultAvatar"
            alt="User Avatar"
            class="avatar"
          />
          <span class="user-name">{{ comment.user.name }}</span>
        </div>

        <div class="comment-text">
          <span v-if="editingCommentId !== comment.id">{{
            comment.content
          }}</span>
          <div v-if="editingCommentId === comment.id">
            <textarea v-model="comment.content" rows="3"></textarea>
            <v-rating
              v-model="comment.rate"
              :max="5"
              active-color="orange-lighten-1"
              color="orange"
            ></v-rating>
          </div>
        </div>

        <div class="comment-time">{{ formatDate(comment.created_at) }}</div>

        <div v-if="comment.hidden === 1 && comment.isEdit === 0" class="hidden-warning">
          <p class="warning-text">
            Bình luận của bạn không phù hợp với nguyên tắc cộng đồng. Hãy chỉnh
            sửa.
          </p>
        </div>
        <div v-if="comment.hidden === 1 && comment.isEdit === 1" class="hidden-warning">
          <p class="warning-text">
            Bình luận của bạn không phù hợp với nguyên tắc cộng đồng.
          </p>
        </div>

        <div v-if="editingCommentId !== comment.id" class="star-rating">
          <v-rating
            v-model="comment.rate"
            :max="5"
            :readonly="true"
            active-color="orange-lighten-1"
            color="orange"
          ></v-rating>
        </div>

        <!-- Edit button -->
        <div
          v-if="
            comment.user.id === currentUser.id &&
            editingCommentId !== comment.id &&
            comment.isEdit !== 1
          "
        >
          <button @click="editComment(comment)">Edit</button>
        </div>

        <!-- Save button -->
        <div
          v-if="
            comment.user.id === currentUser.id &&
            editingCommentId === comment.id
          "
        >
          <button @click="saveComment(comment)">Save</button>
        </div>
      </div>
    </div>

    <!-- Input for new comments -->
    <div class="comment-input" v-if="!commented">
      <textarea
        v-model="newComment"
        placeholder="Add your comment"
        @keyup.enter="submitComment"
        rows="3"
        :disabled="commented"
      ></textarea>

      <!-- Input for rating -->
      <v-rating
        v-model="newCommentRating"
        :max="5"
        active-color="orange-lighten-1"
        color="orange"
      ></v-rating>
      <button @click="submitComment" :disabled="commented">
        <!-- Disable button if commented -->
        Submit
      </button>
    </div>

    <!-- Notification if no editing or adding comments allowed -->
    <div v-if="commented" class="comment-notice">
      <p>You have already commented. You cannot add a new comment.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../axios/api";

const props = defineProps({
  bookingId: {
    type: String,
    required: true,
  },
});

const newCommentRating = ref(0); // Lưu giá trị rating của comment mới

const comments = ref([]);
const newComment = ref("");
const defaultAvatar =
  "https://cdn3.iconfinder.com/data/icons/business-avatar-1/512/3_avatar-512.png";
const commented = ref(false);
const isEditable = ref(false);
const currentUser = ref(JSON.parse(localStorage.getItem("user")));
const editingCommentId = ref(null); // Track the ID of the comment being edited

// Fetch comments
const fetchComments = async () => {
  try {
    const response = await api.get(`/bookings/${props.bookingId}/comments`);
    comments.value = response.data;

    // Check if user has already commented
    const userComment = comments.value.find(
      (comment) => comment.user.id === currentUser.value.id
    );
    console.log(userComment);

    if (userComment) {
      commented.value = true;
      isEditable.value = userComment.isEdit === 0;
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
  }
};

// Edit comment
const editComment = (comment) => {
  editingCommentId.value = comment.id; // Set the editing comment ID
};

// Save comment after editing
const saveComment = async (comment) => {
  try {
    await api.put(`/comments/${comment.id}`, {
      content: comment.content,
      rate: comment.rate,
    });
    editingCommentId.value = null; // Reset editing ID
    fetchComments(); // Refresh the comments after editing
  } catch (error) {
    console.error("Error saving comment:", error);
  }
};

// Submit new comment
const submitComment = async () => {
  if (newComment.value.trim()) {
    try {
      await api.post(`/comments`, {
        booking_id: props.bookingId,
        content: newComment.value,
        rate: newCommentRating.value,
      });
      newComment.value = "";
      fetchComments(); // Refresh comments after submit
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  }
};

const getStaffAvatar = (avatar) => {
  if (avatar && avatar.startsWith("avatars")) {
    return `http://127.0.0.1:8000/storage/${avatar}`;
  }
  return (
    avatar ||
    "https://cdn3.iconfinder.com/data/icons/business-avatar-1/512/3_avatar-512.png"
  );
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
.comment-box {
  background: #fff;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.comments-list {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.comment-item {
  border-bottom: 1px solid #eee;
  padding: 10px 0;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-info .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.user-info .user-name {
  font-weight: bold;
}

.comment-text {
  font-size: 14px;
  margin-top: 5px;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-input {
  display: flex;
  gap: 10px;
  flex-direction: column;
}

textarea {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #ccc;
}

button {
  align-self: flex-end;
  padding: 8px 15px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #218838;
}

.comment-notice {
  margin-top: 10px;
  color: #d9534f;
  font-size: 14px;
}

/* Style cho phần đánh giá sao */
.star-rating {
  display: flex;
  gap: 5px;
  font-size: 18px;
}

.comment-input v-rating {
  margin-top: 10px;
}

.comment-hidden {
  opacity: 0.5;
}

.hidden-warning {
  margin-top: 5px;
  padding: 5px;
  border-left: 3px solid red;
  background-color: #ffeaea;
}

.warning-text {
  color: #d9534f;
  font-size: 14px;
  font-weight: bold;
}
</style>
