from rest_framework.permissions import BasePermission, SAFE_METHODS

ENGINE_PERMISSIONS_REGISTRY = {
    # Student Career Engines
    'skill_gap': ['student', 'admin'],
    'resume_intelligence': ['student', 'admin'],
    'job_intelligence': ['student', 'admin'],
    'career_roadmap': ['student', 'admin'],
    'interview_intelligence': ['student', 'admin'],
    'ai_copilot': ['student', 'admin'],
    'digital_twin': ['student', 'admin'],
    'career_report': ['student', 'admin'],
    'learning_resources': ['student', 'admin'],
    'my_projects': ['student', 'admin'],

    # Problem Owner / Requester Engines
    'submit_problem': ['problem_owner', 'admin', 'student'],
    'owner_portal': ['problem_owner', 'admin'],
    
    # Technical Evaluator Engines
    'evaluator_portal': ['evaluator', 'admin'],

    # Admin Control Engines
    'admin_portal': ['admin'],
    'problem_moderation': ['admin'],
}

class CanAccessEngine(BasePermission):
    """
    Backend Engine Access Control.
    Enforces that the user's authenticated role matches the view's required_engine.
    Returns HTTP 403 Forbidden if a domain user attempts to access an engine outside their scope.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        required_engine = getattr(view, 'required_engine', None)
        if not required_engine:
            return True

        role = getattr(getattr(request.user, 'profile', None), 'role', 'student')
        if request.user.is_staff:
            role = 'admin'

        allowed_roles = ENGINE_PERMISSIONS_REGISTRY.get(required_engine, ['admin'])
        return role in allowed_roles

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
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(getattr(request.user, 'profile', None), 'role', 'student')
        return request.user.is_staff or role in ['student', 'admin']

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
