from django.urls import path, include
from core import views as core_views
from core.admin import admin_site

urlpatterns = [
    path('admin/', admin_site.urls),
    path('', core_views.home, name='home'),
    path('services/', include('services.urls')),   # создадим services/urls.py
    path('contacts/', include('contacts.urls')),   # contacts/urls.py
    path('account/', include('account.urls')),     # account/urls.py
    path('partners/', include('partners.urls')),
]

handler404 = "interauto.views.custom_404"
