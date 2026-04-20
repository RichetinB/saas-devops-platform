*** Settings ***
Library    RequestsLibrary
Library    Collections
Library    String
Suite Setup    Run Keywords    Check API Health    AND    Register Test User And Get Token

*** Variables ***
${BASE_URL}    http://localhost:3001
${TEST_PASSWORD}    TestPassword123

*** Keywords ***
Check API Health
    [Documentation]    Verify API is running before tests
    TRY
        ${response}=    GET    ${BASE_URL}/health
        Should Be Equal As Integers    ${response.status_code}    200
    EXCEPT
        FAIL    API is not running at ${BASE_URL}. Please start the API server.
    END

Register Test User And Get Token
    [Documentation]    Register a unique test user and store the JWT token for the suite
    ${suffix}=    Generate Random String    10    [LOWER]
    ${email}=    Set Variable    tasks-e2e-${suffix}@test.com
    ${payload}=    Create Dictionary    email=${email}    password=${TEST_PASSWORD}
    Create Session    api    ${BASE_URL}    verify=False
    ${response}=    POST On Session    api    /auth/register
    ...    json=${payload}
    ...    expected_status=201
    ${token}=    Get From Dictionary    ${response.json()}    access_token
    Set Suite Variable    ${AUTH_TOKEN}    ${token}
    Log    Registered test user: ${email}

*** Test Cases ***
User Can List Tasks Returns Empty List
    [Documentation]    A newly registered user has no tasks
    ${headers}=    Create Dictionary    Authorization=Bearer ${AUTH_TOKEN}
    ${response}=    GET On Session    api    /tasks    headers=${headers}    expected_status=200
    Log    Response Body: ${response.text}
    ${tasks}=    Set Variable    ${response.json()}
    Should Be True    isinstance($tasks, list)
    Length Should Be    ${tasks}    0

User Can Create A Task
    [Documentation]    Authenticated user can create a new task
    ${headers}=    Create Dictionary    Authorization=Bearer ${AUTH_TOKEN}
    ${payload}=    Create Dictionary    title=My First Robot Task
    ${response}=    POST On Session    api    /tasks
    ...    json=${payload}
    ...    headers=${headers}
    ...    expected_status=201
    Log    Response Body: ${response.text}
    ${body}=    Set Variable    ${response.json()}
    ${task_id}=    Get From Dictionary    ${body}    id
    Should Not Be Empty    ${task_id}
    Set Suite Variable    ${TASK_ID}    ${task_id}
    ${title}=    Get From Dictionary    ${body}    title
    Should Be Equal    ${title}    My First Robot Task
    ${completed}=    Get From Dictionary    ${body}    completed
    Should Be Equal    ${completed}    ${False}

User Can Get Task By ID
    [Documentation]    Authenticated user can retrieve a specific task by its ID
    ${headers}=    Create Dictionary    Authorization=Bearer ${AUTH_TOKEN}
    ${response}=    GET On Session    api    /tasks/${TASK_ID}    headers=${headers}    expected_status=200
    Log    Response Body: ${response.text}
    ${body}=    Set Variable    ${response.json()}
    ${task_id}=    Get From Dictionary    ${body}    id
    Should Be Equal    ${task_id}    ${TASK_ID}

User Can Update A Task
    [Documentation]    Authenticated user can update a task title and mark it completed
    ${headers}=    Create Dictionary    Authorization=Bearer ${AUTH_TOKEN}
    ${payload}=    Create Dictionary    title=Updated Robot Task    completed=${True}
    ${response}=    PUT On Session    api    /tasks/${TASK_ID}
    ...    json=${payload}
    ...    headers=${headers}
    ...    expected_status=200
    Log    Response Body: ${response.text}
    ${body}=    Set Variable    ${response.json()}
    ${title}=    Get From Dictionary    ${body}    title
    Should Be Equal    ${title}    Updated Robot Task
    ${completed}=    Get From Dictionary    ${body}    completed
    Should Be True    ${completed}

User Can Delete A Task
    [Documentation]    Authenticated user can delete a task
    ${headers}=    Create Dictionary    Authorization=Bearer ${AUTH_TOKEN}
    DELETE On Session    api    /tasks/${TASK_ID}    headers=${headers}    expected_status=204

Deleted Task Returns 404
    [Documentation]    Getting a deleted task returns 404
    ${headers}=    Create Dictionary    Authorization=Bearer ${AUTH_TOKEN}
    ${response}=    GET On Session    api    /tasks/${TASK_ID}    headers=${headers}    expected_status=404
    Log    Response Body: ${response.text}

Cannot Access Tasks Without Token
    [Documentation]    Unauthenticated request to tasks endpoint returns 401
    ${response}=    GET On Session    api    /tasks    expected_status=401
    Log    Response Body: ${response.text}
