ARG GO_VERSION
FROM golang:${GO_VERSION} as builder

ARG GOOS
ARG GOARCH
ARG GOARM

ENV GO111MODULE on
ENV GOOS ${GOOS}
ENV GOARCH ${GOARCH}
ENV GOARM ${GOARM}

# RClone
RUN git clone https://github.com/rclone/rclone /go/src/github.com/rclone/rclone
WORKDIR /go/src/github.com/rclone/rclone
RUN git checkout v1.54.0
RUN go get ./...
RUN env ${BUILD_OPTS} go build

# Restic
RUN git clone https://github.com/restic/restic /go/src/github.com/restic/restic
WORKDIR /go/src/github.com/restic/restic
RUN git checkout v0.12.0
RUN go get ./...
RUN GOOS= GOARCH= GOARM= go run -mod=vendor build.go || go run build.go

# Bivac
WORKDIR /go/src/github.com/camptocamp/bivac
COPY ./go.mod .
COPY ./go.sum .
RUN go mod download
COPY ./.git ./.git
COPY ./cmd ./cmd
COPY ./internal ./internal
COPY ./pkg ./pkg
COPY ./main.go .
COPY ./Makefile .
RUN env ${BUILD_OPTS} make bivac

FROM node:lts-alpine as ui-builder
# Bivac-UI
WORKDIR /vite/src/github.com/camptocamp/bivac/bivac-ui
COPY ./bivac-ui/package*.json ./
RUN npm install
COPY ./bivac-ui .
RUN npm run build
RUN ls

FROM debian
RUN apt-get update && \
    apt-get install -y openssh-client procps && \
	rm -rf /var/lib/apt/lists/*
COPY --from=builder /etc/ssl /etc/ssl
COPY --from=builder /go/src/github.com/camptocamp/bivac/bivac /bin/bivac
COPY ./providers-config.default.toml /
COPY --from=builder /go/src/github.com/restic/restic/restic /bin/restic
COPY --from=builder /go/src/github.com/rclone/rclone/rclone /bin/rclone
COPY --from=ui-builder /vite/src/github.com/camptocamp/bivac/bivac-ui/dist/index.html /bivac-ui.html
ENTRYPOINT ["/bin/bivac"]
CMD [""]
