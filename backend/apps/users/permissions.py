from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsPlatformAdmin(BasePermission):
    """
    Allows access only to Platform Admins (is_staff=True or profile.role='admin').
    Strict backend authorization boundary.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return bool(
            request.user.is_staff or 
            (hasattr(request.user, 'profile') and request.user.profile.role == 'admin')
        )

class IsProjectEvaluator(BasePermission):
    """
    Allows access to Technical Evaluators and Platform Admins.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return bool(
            request.user.is_staff or 
            (hasattr(request.user, 'profile') and request.user.profile.role in ['evaluator', 'admin'])
        )

class IsProblemOwner(BasePermission):
    """
    Allows access to Problem Owners / Requesters and Platform Admins.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return bool(
            request.user.is_staff or 
            (hasattr(request.user, 'profile') and request.user.profile.role in ['problem_owner', 'admin'])
        )

class IsStudentUser(BasePermission):
    """
    Allows access to authenticated student users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

class IsResourceOwner(BasePermission):
    """
    Object-level permission to ensure a user can only access their own resources
    (Projects, Resumes, Roadmaps, Interviews, Submissions).
    Prevents URL/ID parameter tampering.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Platform admins have full access
        if request.user.is_staff or (hasattr(request.user, 'profile') and request.user.profile.role == 'admin'):
            return True

        # Check ownership attributes
        if hasattr(obj, 'user') and obj.user:
            return obj.user == request.user
        if hasattr(obj, 'student') and obj.student:
            return obj.student == request.user
        if hasattr(obj, 'submitted_by') and obj.submitted_by:
            return obj.submitted_by == request.user

        return False
