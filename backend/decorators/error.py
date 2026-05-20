from flask import jsonify
from functools import wraps
from classes.Error import InputError, AccessError
import traceback

# Wrapper func - wraps return
#
# Returns 1 OR 2
# 1. Returns the func's expected return value
# (e.g. admin_auth_register -> str, returns a token)


# 2. Execption is raised, and is returned automatically in JSON format directly - overidding Flask decorator
def catch_errors(func):
    """Decorator func to catch errors OR return original func(*args, **kwargs)"""

    @wraps(func)
    def error_wrapper_func(*args, **kwargs):
        try:
            return func(*args, **kwargs)

        # specific errors - InputError and AccessError
        except (InputError, AccessError) as err:
            print(f"DEBUG - Caught error in function '{func.__name__}':", err)
            traceback.print_exc()

            response = jsonify({"error": str(err)})
            response.status_code = err.status_code
            return response

        # handle all other exceptions - print errors
        except Exception as err:
            print(f"DEBUG - Unhandled Exception in function '{func.__name__}':", err)
            traceback.print_exc()

            response = jsonify({"error": f"Internal Server Error: {str(err)}"})
            response.status_code = 500
            return response

    return error_wrapper_func
