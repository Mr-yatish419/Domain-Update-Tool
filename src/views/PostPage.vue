<template>
    <div>
        <h2>Posts Details</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Id</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="post in posts" :key="post.id">
                    <td>{{ post.id }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import axios from 'axios'; // Import axios

export default {
    data() {
        return {
            posts: [],
        };
    },
    mounted() {
        axios.get('http://localhost/sentence-validation/posts.php') // Update endpoint URL
            .then((response) => {
                console.log('Response data:', response.data); // Log the response data
                this.posts = response.data;
            })
            .catch((error) => {
                console.error('Error fetching posts:', error);
            });
    },
};
</script>


<style scoped></style>