from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.conf import settings


class ClientApplication(models.Model):
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    STATUS_CHOICES = [
        ('waiting', 'На рассмотрении'),
        ('accepted', 'Принят'),
        ('canceled', 'Отменено'),
    ]
    detail = models.CharField(max_length=100)
    comment = models.CharField(max_length=100, blank=True)

    delivery = models.CharField(max_length=20, default='delivery')
    payment_method = models.CharField(max_length=20, default='card')
    reservation = models.CharField(max_length=5, default='no')
    reservation_days = models.IntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='waiting'
    )

    class Meta:
        db_table = 'account_client_applications'

    def __str__(self):
        return f'Заявка {self.id}'


class ClientManager(BaseUserManager):
    def create_user(self, email, password=None, first_name='', last_name='', phone_number=''):
        if not email:
            raise ValueError('Пользователь должен иметь email')
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone_number
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None):
        user = self.create_user(email=email, password=password)
        user.is_admin = True
        user.save(using=self._db)
        return user


class Client(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50)
    phone_number = models.CharField(max_length=20)

    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    objects = ClientManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

    @property
    def is_staff(self):
        return self.is_admin

    def has_perm(self, perm, obj=None):
        return self.is_admin

    def has_module_perms(self, app_label):
        return self.is_admin
