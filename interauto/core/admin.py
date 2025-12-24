from django.contrib.admin import AdminSite
from django.contrib import admin
from django.http import Http404


class MyAdminSite(AdminSite):
    def has_permission(self, request):
        if not request.user.is_authenticated:
            return False
        # Если юзер есть, но не админ → возвращаем 404
        if not request.user.is_staff:
            raise Http404("Такой страницы не существует")
        return True


admin_site = MyAdminSite(name='myadmin')
