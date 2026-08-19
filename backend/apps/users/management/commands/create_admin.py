from django.core.management.base import BaseCommand
from apps.users.models import User, UserProfile

class Command(BaseCommand):
    help = 'Securely initializes or creates a Platform Admin account'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, required=True, help='Admin email address')
        parser.add_argument('--password', type=str, required=True, help='Admin password')
        parser.add_argument('--username', type=str, default='admin', help='Admin username')

    def handle(self, *args, **options):
        email = options['email'].strip().lower()
        password = options['password'].strip()
        username = options['username'].strip()

        user, created = User.objects.get_or_create(
            email=email,
            defaults={'username': username, 'is_staff': True, 'is_superuser': True}
        )

        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = 'admin'
        profile.save()

        if created:
            self.stdout.write(self.style.SUCCESS(f'Successfully created Platform Admin account: {email}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Successfully updated Platform Admin credentials for: {email}'))
