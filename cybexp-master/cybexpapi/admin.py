from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

from .models import Profile

class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'

class CustomUserAdmin(UserAdmin):
    inlines = (ProfileInline, )
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'get_orgid', 'get_tzname')
    list_select_related = ('profile', )

    def get_tzname(self, instance):
        return instance.profile.tzname
    get_tzname.short_description = 'Timezone Name'
    
    def get_orgid(self, instance):
        return instance.profile.orgid
    get_orgid.short_description = 'Organization ID'    
    
    
    def get_inline_instances(self, request, obj=None):
        if not obj:
            return list()
        return super(CustomUserAdmin, self).get_inline_instances(request, obj)


admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
