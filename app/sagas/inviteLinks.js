import { put, takeLatest, delay } from 'redux-saga/effects';
import { Alert } from 'react-native';

import { INVITE_LINKS } from '../actions/actionsTypes';
import { inviteLinksSuccess, inviteLinksFailure } from '../actions/inviteLinks';
import RocketChat from '../lib/rocketchat';
import log from '../utils/log';
import Navigation from '../lib/Navigation';
import I18n from '../i18n';

const handleRequest = function* handleRequest({ token }) {
	try {
		const validateResult = yield RocketChat.validateInviteToken(token);
		if (!validateResult.valid) {
			yield put(inviteLinksFailure());
			return;
		}

		const result = yield RocketChat.useInviteToken(token);
		if (!result.success) {
			yield put(inviteLinksFailure());
			return;
		}

		if (result.room && result.room.rid) {
			yield delay(1000);
			yield Navigation.navigate('RoomsListView');
			const { room } = result;
			Navigation.navigate('RoomView', {
				rid: room.rid,
				name: RocketChat.getRoomTitle(room),
				t: room.t
			});
		}

		yield put(inviteLinksSuccess());
	} catch (e) {
		yield put(inviteLinksFailure());
		log(e);
	}
};

const handleFailure = function handleFailure() {
	Alert.alert(I18n.t('Oops'), I18n.t('Invalid_or_expired_invite_token'));
};

const root = function* root() {
	yield takeLatest(INVITE_LINKS.REQUEST, handleRequest);
	yield takeLatest(INVITE_LINKS.FAILURE, handleFailure);
};

export default root;