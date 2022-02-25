/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import React, { useState } from 'react';
import { useIntl } from 'react-intl';

import { usePandaBridge } from 'pandasuite-bridge-react';
import { Button, Alert } from 'pandasuite-bridge-react/lib/ui';
import { isHotkeyPressed, useHotkeys } from 'react-hotkeys-hook';

import PandaBridge from 'pandasuite-bridge';
import Keysmap from './constants/keysmap.json';

const pkeys = (keys, key) => {
  if (keys.indexOf(key) === -1) {
    keys.push(key);
  }
  return keys;
};

const pkeysStr = (keysStr, key) => {
  if (keysStr.indexOf(key) === -1) {
    keysStr.push(key);
  }
  return keysStr;
};

function App() {
  const [keys, setKeys] = useState({});
  const { keyCode = [], keyStr = [], recording = false } = keys;
  const intl = useIntl();

  usePandaBridge({
    markers: {
      getSnapshotDataHook: () => ({
        id: keyStr.join('+'),
        data: {
          keyStr,
          keyCode,
        },
      }),
      setSnapshotDataHook: ({ data }) => {
        const { keyStr: keyStrHook, keyCode: keyCodeHook } = (data || {}).data || {};

        setKeys({ keyStr: keyStrHook, keyCode: keyCodeHook });
      },
    },
  });

  useHotkeys('*', (evn) => {
    evn.preventDefault();
    const hotKeyCode = [];
    const hotKeyStr = [];

    if (isHotkeyPressed('shift')) {
      pkeys(hotKeyCode, 16);
      pkeysStr(hotKeyStr, 'Shift');
    }
    if (isHotkeyPressed('alt')) {
      pkeys(hotKeyCode, 18);
      pkeysStr(hotKeyStr, 'Alt');
    }
    if (isHotkeyPressed('control')) {
      pkeys(hotKeyCode, 17);
      pkeysStr(hotKeyStr, 'Control');
    }
    if (isHotkeyPressed('command')) {
      pkeys(hotKeyCode, 91);
      pkeysStr(hotKeyStr, 'Command');
    }
    if (Keysmap[evn.keyCode]) {
      hotKeyStr.push(Keysmap[evn.keyCode]);
    } else if (evn.keyCode >= 48 && evn.keyCode <= 90) {
      hotKeyStr.push(String.fromCharCode(evn.keyCode));
    }
    if (hotKeyCode.indexOf(evn.keyCode) === -1) {
      hotKeyCode.push(evn.keyCode);
    }

    PandaBridge.send(PandaBridge.TRIGGER_MARKER, hotKeyStr.join('+'));
    PandaBridge.send('keyPressed', {
      code: hotKeyCode,
      str: hotKeyStr,
    });

    setKeys({ keyCode: hotKeyCode, keyStr: hotKeyStr, recording: true });
  });

  if (!PandaBridge.isStudio) {
    return null;
  }

  const onRecord = () => {
    setKeys({ recording: !recording });
  };

  window.addEventListener('blur', () => {
    setKeys({ keyStr, keyCode, recording: false });
  });

  return (
    <div className="flex flex-col content-center items-center h-screen">
      <>
        <Alert className="mt-4 mx-1">
          {intl.formatMessage({ id: 'main.info.text' })}
        </Alert>
        <Button loading={recording} primary={!recording} className="my-5" onClick={onRecord}>
          {intl.formatMessage({ id: 'main.button.record' })}
        </Button>
        <div className="flex flex-row space-x-2 h-[24px]">
          {recording && keyStr.map((key, i) => (
            <>
              {(i > 0) ? <span className="text-gray-600">+</span> : null}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800">
                {key}
              </span>
            </>
          ))}
        </div>
      </>
    </div>
  );
}

export default App;
