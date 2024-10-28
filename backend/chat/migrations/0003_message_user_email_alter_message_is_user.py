# Generated by Django 4.2.16 on 2024-10-28 20:59

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("chat", "0002_conversation_is_active_conversation_user_email_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="message",
            name="user_email",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name="message",
            name="is_user",
            field=models.BooleanField(default=False),
        ),
    ]
