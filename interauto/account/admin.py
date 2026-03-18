from django.contrib import admin
from .models import Client, ClientApplication
from core.admin import admin_site


class ClientApplicationAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'client_full_name',
        'client_phone',
        'detail',
        'comment',
        'created_at'
    )

    def client_full_name(self, obj):
        return f"{obj.client.last_name} {obj.client.first_name} {obj.client.middle_name}"
    client_full_name.short_description = "ФИО"

    def client_phone(self, obj):
        return obj.client.phone_number
    client_phone.short_description = "Телефон"


# регистрация моделей в админке
admin_site.register(Client)
admin_site.register(ClientApplication, ClientApplicationAdmin)
