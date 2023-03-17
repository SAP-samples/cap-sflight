
function read-value() {
    if [ -f .values.yaml ]; then
        local VALUE="$(yaml2json <.values.yaml | jq -er "$1" || echo "")"
        if [ "$VALUE" != "" -a "$VALUE" != "null" ]; then
            echo "$VALUE"
            return
        fi
    fi

    local VALUE="$(helm inspect values ./chart --jsonpath="{$1}")"
    echo "$VALUE"
}

function true-value() {
    local VALUE="$(read-value "$1")"
    if [ "$VALUE" == "" -o "$VALUE" == "false" ]; then
        return 1
    else
        return 0
    fi
}

function value() {
    local VALUE="$(read-value "$1")"
    if [ "$VALUE" == "" ]; then
        echo >&2 "ERROR: Expect value for $1 in chart/values.yaml"
        return 1
    fi

    echo "$VALUE"
}

function image() {
    local REPOSITORY="$(value "$1.image.repository")"
    local TAG="$(read-value "$1.image.tag")"
    if [ "$TAG" != "" ]; then
        echo "$REPOSITORY:$TAG"
    else
        echo "$REPOSITORY"
    fi
}