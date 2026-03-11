from billing.models import AuditLog

def log_action(user, action, instance, details=None):
    if details is None:
        details = {}
    
    AuditLog.objects.create(
        user=user if user and user.is_authenticated else None,
        action=action,
        model_name=instance.__class__.__name__,
        object_id=instance.id,
        details=details
    )
