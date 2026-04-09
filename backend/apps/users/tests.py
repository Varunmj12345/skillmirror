from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import User

class UserTests(APITestCase):

    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'password': 'testpassword123'
        }
        self.user = User.objects.create_user(**self.user_data)

    def test_user_creation(self):
        response = self.client.post(reverse('user-create'), self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 2)  # 1 existing + 1 new
        self.assertEqual(User.objects.get(username='testuser').email, 'testuser@example.com')

    def test_user_login(self):
        response = self.client.post(reverse('user-login'), {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_profile_retrieval(self):
        self.client.login(username='testuser', password='testpassword123')
        response = self.client.get(reverse('user-profile', kwargs={'pk': self.user.id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user.username)

    def test_user_update(self):
        self.client.login(username='testuser', password='testpassword123')
        response = self.client.patch(reverse('user-profile', kwargs={'pk': self.user.id}), {
            'email': 'newemail@example.com'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'newemail@example.com')

    def test_user_deletion(self):
        self.client.login(username='testuser', password='testpassword123')
        response = self.client.delete(reverse('user-profile', kwargs={'pk': self.user.id}))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(User.objects.count(), 1)  # Only the original user should remain