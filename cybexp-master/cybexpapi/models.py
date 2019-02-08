from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    orgid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, verbose_name='Organization ID')
    organizationname = models.CharField(max_length=256, blank=True, verbose_name='Organization Name')
    tzname = models.CharField(max_length=50, blank=True, verbose_name='Timezone Name')

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
