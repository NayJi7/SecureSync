# Generated by Django 5.2 on 2025-05-05 11:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('object', '0009_alter_object_consomation'),
    ]

    operations = [
        migrations.AlterField(
            model_name='object',
            name='Prison_id',
            field=models.CharField(blank=True, max_length=20, null=True, verbose_name='Prison ID'),
        ),
    ]
