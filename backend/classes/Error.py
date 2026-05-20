# custon error execption classes to be raised within route based decorators
# e.g. catch_errors() inside decorator/

# Input Errors - User Error
class InputError(Exception):
    def __init__(self, message):
        super().__init__(message)
        self.name = "InputError"
        self.status_code = 400

# Access Errors - Unauthorised
class AccessError(Exception):
    def __init__(self, message):
        super().__init__(message)
        self.name = "AccessError"
        self.status_code = 403
